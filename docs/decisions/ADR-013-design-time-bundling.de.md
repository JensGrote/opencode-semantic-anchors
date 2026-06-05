# ADR-013: Design-Zeit-Bündelung von Anchor-Regeln (statt Runtime-Fetch)

## Status
Accepted

## Context
Das Plugin setzt Regeln durch, die aus dem [LLM-Coding/Semantic-Anchors](https://github.com/LLM-Coding/Semantic-Anchors)-Repository abgeleitet sind. Diese Anchor-Regeln (z.B. Step Confirmation, Source Anchor, BLUF) müssen der `RuleEngine` zur Laufzeit zur Verfügung stehen.

Das Semantic-Anchors-Repository ist die kanonische Quelle für Anchor-Definitionen. Die Frage ist: an welchem Punkt im Lifecycle soll das Plugin diese Definitionen beziehen?

Zwei grundlegend unterschiedliche Ansätze existieren:

### Option A: Runtime-Fetching
Das Plugin holt die aktuellsten Anchor-Definitionen bei jedem Start von GitHub (oder periodisch mit Caching).

```typescript
// Hypothetischer Runtime-Fetch-Ansatz
async function loadAnchors(): Promise<AnchorRule[]> {
  const response = await fetch('https://raw.githubusercontent.com/LLM-Coding/Semantic-Anchors/main/anchors.json')
  return response.json()
}
```

**Vorteile:**
- Immer aktuellste Anchor-Definitionen
- Keine Release-Koordination mit Semantic-Anchors-Repository
- Kleinere Paketgröße (keine gebündelten Defaults)

**Nachteile:**
- **Runtime-Abhängigkeit von GitHub** — Wenn GitHub nicht erreichbar ist, kann das Plugin keine Regeln laden
- **Versions-Skew** — Gleiche Plugin-Version kann sich je nach Startzeitpunkt anders verhalten
- **Latenz** — Netzwerk-Request bei jedem Start (oder Cache-Invalidierungs-Komplexität)
- **Offline-Fehler** — Plugin funktioniert nicht ohne Internetzugriff
- **Verletzt Architecture Constraint** ("No external services – All enforcement logic runs locally")

### Option B: Design-Zeit-Bündelung (gewählt)
Anchor-Regeln werden zur Design-Zeit aus dem Semantic-Anchors-Repository abgeleitet und als YAML-Default-Preset im npm-Paket gebündelt.

```yaml
# dist/defaults.yaml (im Paket gebündelt)
contracts:
  - id: step-confirmation
    mode: BLOCK
    triggers:
      - type: tool
        pattern: "*"
        count: 3
  - id: source-anchor
    mode: WARN
    triggers:
      - type: tool
        pattern: "write"
```

**Vorteile:**
- Keine Runtime-Abhängigkeiten — keine Netzwerkaufrufe, keine GitHub-Verfügbarkeitsprobleme
- Deterministisch — Plugin-Version X setzt immer Regelset Y durch
- Offline-fähig — komplett ohne Internet nutzbar
- User-Autonomie — lokale Config überschreibt gebündelte Defaults

**Nachteile:**
- Update-Verzögerung — User müssen das Plugin aktualisieren, um neue Anchor-Definitionen zu erhalten
- Release-Koordination — gebündelte Defaults müssen bei upstream-Änderungen aktualisiert werden
- Leicht größere Paketgröße (~5KB für Defaults)

### Option C: Git Subtree / Submodule
Das Semantic-Anchors-Repository wird als Git Subtree ins Plugin-Repository eingebunden. Zur Build-Zeit werden die Anchor-Definitionen extrahiert und gebündelt.

**Vorteile:**
- Trackt immer einen spezifischen Commit von upstream
- Einfach zu aktualisieren (git subtree pull)
- Keine Runtime-Abhängigkeit

**Nachteile:**
- Git-Subtree-Komplexität — Merge-Konflikte, History-Aufblähung
- Erhöht Repository-Größe erheblich
- Nicht anwendbar für npm-Paket ohne Git-History
- Löst das Runtime-Distributionsproblem nicht — Bündelung für npm weiterhin nötig

## Evaluation Criteria

| Kriterium | Gewicht | Beschreibung |
|-----------|---------|--------------|
| Runtime-Unabhängigkeit | Kritisch | Keine externen Netzwerk-Calls während Enforcement |
| Determinsmus | Kritisch | Gleiche Version = gleiches Verhalten über Sessions |
| Offline-Fähigkeit | Hoch | Muss ohne Internetzugriff funktionieren |
| Update-Einfachheit | Mittel | User sollen einfach neue Regeln bekommen können |
| Paketgröße | Niedrig | Impact auf npm install |
| Wartungsaufwand | Mittel | Aufwand, gebündelte Regeln aktuell zu halten |

## Decision
**Option B: Design-Zeit-Bündelung** wurde gewählt.

Anchor-Regeln werden als gebündeltes YAML-Default-Preset (`dist/defaults.yaml`) im npm-Paket ausgeliefert. Der `ConfigLoader` liest diese Datei als Fallback, wenn keine User-Config unter `~/.config/opencode/opencode-semantic-anchors.yaml` existiert.

Der Bündelungsprozess ist automatisiert via `scripts/bundle-defaults.sh`, das Regeln aus dem Semantic-Anchors-Subtree extrahiert und in YAML konvertiert. Ein wöchentlicher GitHub Actions-Workflow prüft auf upstream-Änderungen und erstellt einen PR zum Update des Bundles.

## Consequences

### Positiv
- **Keine Runtime-Abhängigkeiten** — Keine HTTP-Calls, keine Netzwerk-Failures, kein GitHub-Ausfall beeinträchtigt die Durchsetzung. Erfüllt direkt das Architecture Constraint "No external services".
- **Deterministisches Verhalten** — Plugin-Version X setzt immer dieselben Regeln durch. Reproduzierbar über Sessions, Maschinen und Teammitglieder hinweg.
- **Offline-fähig** — Alle Enforcement-Logik funktioniert ohne Internetzugriff. Keine Latenz- oder Timeout-Failures.
- **User-Autonomie** — Lokale Config überschreibt gebündelte Defaults ohne Fork oder upstream PR. User mit eigenen Regeln erstellen einfach ihre `opencode-semantic-anchors.yaml`.
- **Versionierte Updates** — Plugin-Update ist ein expliziter Akt; Regeln ändern sich nicht unerwartet zwischen Sessions.

### Negativ
- **Update-Verzögerung** — User müssen das Plugin aktualisieren (npm update), um neue oder geänderte Anchor-Definitionen von upstream zu erhalten. Kein "Live-Pull" von Hotfixes.
- **Release-Koordination** — Die gebündelten Defaults müssen im Release-Prozess aktualisiert werden, wenn das Semantic-Anchors-Repository Anchors hinzufügt oder ändert. Risiko von Drift zwischen upstream und gebündelter Version bei versäumten Updates.
- **Paketgrößen-Erhöhung** — ~5KB zusätzlich im npm-Paket (in der Praxis vernachlässigbar).

### Mitigation
- Wöchentlicher automatisierter PR via GitHub Actions (`schedule: weekly`) prüft das upstream-Repository auf Änderungen und erstellt einen Update-PR
- Das Skript `scripts/bundle-defaults.sh` ist Teil der standardmäßigen Release-Checkliste
- Das `/anchor config-reload` Tool funktioniert für Bundle und User-Config (kein Neustart nötig nach Config-Änderung)
- User, die sofortige upstream-Änderungen benötigen, können das Bundle manuell aus dem Semantic-Anchors-Repo kopieren

## Related
- Decision 7 in 04-solution-strategy.md (Kurzform dieser ADR)
- Architecture Constraint "No external services" in 02-architecture-constraints.md
- `config/loader.ts` in 05-building-block-view.md (ConfigLoader liest gebündelte Defaults)
- ADR-003: YAML Config (hat YAML als Config-Format für diese Regeln gewählt)
- ADR-004: Take before Buy before Make (hier angewandtes Design-Prinzip)

## Compliance

| Constraint / Goal | Erfüllt durch |
|-------------------|---------------|
| Architecture Constraint: No external services | Keine Netzwerkaufrufe zur Laufzeit |
| Quality Goal: Reliability (Determinism) | Gleiche Version = gleiche Regeln |
| Quality Goal: Workflow Continuity | Keine Netzwerkabhängigkeit → keine Latenz-/Timeout-Failures |
| Quality Goal: Configuration Clarity | Gebündelte Defaults dienen als dokumentiertes Config-Beispiel |

## Sources
- LLM-Coding/Semantic-Anchors Repository: https://github.com/LLM-Coding/Semantic-Anchors
- opencode Architecture Constraint Dokumentation: 02-architecture-constraints.md in diesem Projekt
- `agentcontract/spec` Bündelungs-Pattern: https://github.com/agentcontract/spec (liefert Default-Contracts als YAML im Paket)
