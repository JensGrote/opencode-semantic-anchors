# Querschnittskonzept: Sicherheit

## 1. Bedrohungsmodell

### Geschützte Werte

| Wert | Beschreibung | Wert |
|------|-------------|------|
| Config-Datei-Integrität | `opencode-semantic-anchors.yaml` definiert Steering-Regeln | Hoch |
| Session-State-Integrität | `toolCallCount`, `overrideCount`, aktive Rolle | Mittel |
| Plugin-Ausführungsintegrität | Plugin muss Regeln korrekt durchsetzen | Hoch |
| Quellcode des Benutzers | Plugin kann Tool-Argumente lesen (toolName, args) | Hoch |

### Bedrohungen

| Bedrohung | Auswirkung | Wahrscheinlichkeit | Gegenmassnahme |
|-----------|-----------|-------------------|---------------|
| **Config-Manipulation** — Angreifer ändert YAML, um Enforcement zu deaktivieren | Steering-Bypass | Niedrig (lokale Datei) | Dateiberechtigungen (Benutzerbesitz); Config-Hash-Verifikation (v2) |
| **Config-Injection** — Angreifer injiziert YAML mit bösartigen Trigger-Mustern | Denial of Service | Niedrig | Zod-Schema-Validierung lehnt unbekannte Felder ab |
| **Speicheroffenlegung** — Session-State durch Crash-Dump offengelegt | Offenlegung des Override-Zählers | Sehr niedrig | Nur In-Memory, keine persistente Speicherung |
| **Dependency-Kompromittierung** — bösartiges npm-Paket | Vollständige Kompromittierung | Niedrig | Lock-Datei, `npm audit`, Renovate, Supply-Chain-Überwachung |
| **Plugin-Hook-Bypass** — opencode-Bug erlaubt Umgehung des Hooks | Enforcement-Bypass | Niedrig | Fail-Open als Fallback; opencode SDK Issues werden verfolgt |
| **PII in Tool-Argumenten** — Benutzer schließt versehentlich Secrets in Dateipfade ein | Informationsoffenlegung | Mittel | Plugin logged KEINE Tool-Argumente — nur toolName |

### Was das Plugin NICHT handhabt

| Sicherheitsdomäne | Zuständig | Begründung |
|------------------|-----------|-----------|
| Authentifizierung | opencode selbst | Plugin authentifiziert keine Benutzer |
| Autorisierung | opencode-Berechtigungssystem | Plugin verwendet `edit`-Berechtigung für Config-Reload |
| Netzwerksicherheit | Benutzerumgebung | Plugin hat keine externen HTTP-Aufrufe |
| Secrets-Verwaltung | age, 1Password usw. | Plugin schließt Secrets explizit aus |
| Dateisystem-Berechtigungen | Betriebssystem | Plugin liest YAML aus benutzereigenem Config-Verzeichnis |

> **Source Anchor (Quelle):** Architecture Constraints (02-architecture-constraints.md): "No secrets — Plugin never handles passwords, tokens, or API keys. No integration with age or other secret stores." — Section 2, Technical Constraints.

## 2. Eingabevalidierung

### YAML-Config-Validierung

Die gesamte Konfiguration wird vor dem Laden gegen ein **Zod-Schema** validiert:

| Validierung | Methode | Lehnt ab |
|------------|---------|---------|
| Contract-ID-Format | `.min(1)` | Leere IDs |
| Mode | `z.enum(['BLOCK', 'WARN'])` | Ungültige Modi |
| Trigger-Typ | `z.enum(['tool', 'message', 'state'])` | Unbekannte Typen |
| Trigger-Muster | String-Regex-Validierung | Ungültige Muster |
| maxOverrides | `z.number().default(3)` | Nicht-numerische Werte |
| Unbekannte Felder | Zod `.strict()` oder Passthrough mit Warnung | Konfigurierbar |

```typescript
// Aus config/schema.ts — strukturelle Validierung
export const StructuralCouplingContractSchema = z.object({
  id: z.string().min(1),
  mode: z.enum(['BLOCK', 'WARN']),
  description: z.string(),
  anchorRefs: z.array(z.string()).optional(),
  triggers: z.array(TriggerSpecSchema).min(1),
  maxOverrides: z.number().default(3),
})
```

> **Source Anchor (Quelle):** Zod documentation: https://zod.dev/. Zod `.strict()` rejects unknown keys; `.passthrough()` allows them with warnings.

### Tool-Eingabevalidierung

Custom Tools (`anchor-bypass`, `anchor-status`, `anchor-config-reload`) validieren ihre eigenen Parameter:

| Tool | Parameter | Validierung |
|------|-----------|------------|
| `anchor-bypass` | `reason: string` | Erforderlich, nicht leer |
| `anchor-status` | Keine | — |
| `anchor-config-reload` | Keine | Prüft `edit`-Berechtigung |

## 3. Logging und PII

### Logging-Richtlinie

| Geloggt | Nicht geloggt | Begründung |
|---------|--------------|-----------|
| Tool-Name (z. B. „edit", „write") | Tool-Argumente (Dateipfade, Inhalt) | Argumente können proprietären Code oder Secrets enthalten |
| Contract-ID (z. B. „step-confirmation") | Benutzeridentität oder Agentenname | PII-Minimierung (DSGVO Art. 5(1)(c)) |
| Urteil (allow/block/warn) | IP-Adressen, Hostnamen | Nicht für Enforcement benötigt |
| Override-Zähler + Grund | Vollständiger Konversationsverlauf | Gründe sind benutzerdefinierte, kurze Zeichenfolgen |
| Zeitstempel (sitzungsrelativ) | Absolute Zeitstempel oder Zeitzone | Vermeidet Sitzungsrekonstruktion |

> **Source Anchor (Quelle):** GDPR Article 5(1)(c) — Data minimisation: "Personal data shall be adequate, relevant and limited to what is necessary in relation to the purposes for which they are processed."

### Log-Speicherung

- Logs sind **nur In-Memory** während der Sitzung
- Werden vom Plugin **nicht auf die Festplatte** gespeichert
- Gehen bei opencode-Neustart verloren
- opencode selbst kann Plugin-Interaktionen loggen — das liegt außerhalb der Kontrolle des Plugins

### ISO 27001: Datenleckschutz (A.8.12)

Das Plugin stellt sicher, dass keine Daten abfließen, indem es:
- **Keine externen HTTP-Aufrufe** tätigt (Architekturvorgabe)
- **Keine Dateien schreibt** außer dem Lesen seiner eigenen Config-YAML
- **Keine Netzwerkverbindungen** jeglicher Art herstellt
- **Keine Telemetrie** sendet — das Plugin telefoniert nicht nach Hause

## 4. Supply-Chain-Sicherheit

### Dependency-Verifikation

| Massnahme | Status | Implementierung |
|-----------|--------|----------------|
| Lock-Datei | ✅ Erforderlich | `package-lock.json` im Repository eingecheckt |
| Integritätsprüfung | ✅ npm Built-in | `npm install` verifiziert SHA-512-Integrität aus der Registry |
| Signatur-Verifikation | ✅ npm v10+ | `npm audit signatures` verifiziert Paket-Provenienz |
| SBOM | 🔄 Geplant (v1.1) | `cyclonedx-bom` oder `npm sbom` in CI |

> **Source Anchor (Quelle):** npm registry integrity: https://docs.npmjs.com/about-registry-integrity-and-signatures. "Packages in the npm registry include integrity checksums (SHA-512) and optionally package signatures."

### Schwachstellen-Scan-Rhythmus

| Scan | Häufigkeit | Tool | Aktion bei Fund |
|------|-----------|------|----------------|
| Runtime-Abhängigkeiten | Wöchentlich | Renovate + `npm audit` | Patch innerhalb SLA |
| Dev-Abhängigkeiten | Wöchentlich | Renovate + `npm audit` | Automerge Patch/Minor |
| Transitive Abhängigkeiten | Wöchentlich | Renovate (via `npm audit`) | Von direkten Abhängigkeiten geerbt |
| Vollständiger Audit | Vor Release | `npm audit --audit-level=high` | Release blockieren bei hoch/kritisch |

## 5. Sichere Entwicklung

### Sicherheit des Entwickler-Arbeitsplatzes

| Praxis | Standard |
|--------|----------|
| 2FA auf GitHub | Erforderlich für alle Maintainer |
| Signierte Commits | GPG- oder SSH-Commit-Signierung |
| Keine Secrets im Code | `.env`-Dateien sind ausgeschlossen; `age` für lokale Secrets |
| Dependency-Updates | Renovate-Bot, niemals manuelles `npm install --save` ohne Prüfung |

### Code-Review-Anforderungen

| Änderungstyp | Prüfer | Muss enthalten |
|-------------|--------|---------------|
| Fehlerbehebung | 1 Maintainer | Testfall, der den Fehler reproduziert |
| Neues Feature | 2 Maintainer | Tests, CHANGELOG-Eintrag, Anchor-Dokumentation |
| Config-Schema-Änderung | 2 Maintainer | Migrationsanleitung, Zod-Schema-Update |
| Sicherheitsfix | 2 Maintainer | GH Security Advisory-Referenz |

### Tests auf Sicherheit

| Testtyp | Deckt ab | Werkzeug |
|---------|---------|---------|
| Unit-Tests | Enforcement-Logik, Grenzfälle | vitest |
| Eingabevalidierung | Fehlerhaftes YAML, Injection-Versuche | vitest + Zod |
| Hook-Fehlerbehandlung | Fail-Open-Verhalten, Crash Recovery | vitest mit Mock |
| Supply Chain | Dependency-Schwachstellen | npm audit + Renovate |

## 6. Incident Response

### Behandlung von Sicherheitsvorfällen

Für den Code des Plugins selbst (nicht für opencode oder Benutzersysteme):

1. **Melden** via GitHub Security Advisory oder E-Mail an security@semantic-anchors.dev
2. **Sichten** innerhalb von 48 Stunden — Schweregrad und betroffene Versionen bestimmen
3. **Behebung** in privatem Fork entwickeln
4. **Patch** als PATCH-Version erhöht veröffentlichen
5. **Offenlegung** — CVE + GH Advisory nach Verfügbarkeit des Patches veröffentlichen
6. **Post-Mortem** innerhalb von 14 Tagen

### Sicherheitsgrenzen bei bestimmungsgemäßem Gebrauch

Das Plugin arbeitet innerhalb der opencode-Sandbox:
- Plugin-Code läuft im selben Node.js-Prozess wie opencode
- Plugin hat Zugriff auf: Tool-Namen, Tool-Argumente (von opencode übergeben), Dateisystem (Config lesen)
- Plugin hat KEINEN Zugriff auf: Netzwerk, Benutzerzugangsdaten, anderen Prozessspeicher
- Wenn opencode selbst kompromittiert ist, kann das Plugin keine Sicherheitsgarantien geben

> **Boundary Anchor (Scope-Grenze):** Das Plugin kann keine Sicherheitsgarantien geben, wenn opencode selbst kompromittiert ist. Es ist ein runtime steering tool, kein security enforcement layer. Die Sicherheit des Gesamtsystems hängt von der Sicherheit der opencode-Installation ab.
