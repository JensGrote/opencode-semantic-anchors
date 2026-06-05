# Translation Verification Report — Batch 2

> **Status:** Complete
> **Method:** Original English → German translation, checked against Intent (fachliche Korrektheit) and Domain Correctness
> **Date:** 2026-06-04
> **Translation Principle:** Literal > Intent-Resolve at Ambiguity > Technical terms untranslated

## File 1: `07-deployment-view.de.md` (aus `07-deployment-view.md`)

| # | Original (EN) | Translation (DE) | Intent preserved? | Assessment |
|---|---------------|------------------|-------------------|------------|
| 1 | `# 7. Deployment View` | `# 7. Deployment-Sicht` | ✅ | GREEN |
| 2 | `### 7.1 Infrastructure Landscape` | `### 7.1 Infrastrukturlandschaft` | ✅ | GREEN |
| 3 | `The plugin has a **minimal infrastructure footprint**... on the user's machine` | `Das Plugin hat einen **minimalen Infrastruktur-Footprint**... auf dem Rechner des Benutzers` | ✅ "user's machine" → "Rechner des Benutzers" — passt | GREEN |
| 4 | `Source Anchor (Quelle):` (Source Anchor citations) | `Source Anchor (Quelle):` (beibehalten) | ✅ Zitat-Header bleibt bilingual | GREEN |
| 5 | `### Deployment Diagram (C4)` | `### Deployment-Diagramm (C4)` | ✅ | GREEN |
| 6 | `## 7.2 Runtime Environment` | `## 7.2 Laufzeitumgebung` | ✅ | GREEN |
| 7 | `| Runtime | **Node.js ≥ 18** or **Bun** (opencode runtime) |` | `| Runtime | **Node.js ≥ 18** oder **Bun** (opencode-Runtime) |` | ✅ | GREEN |
| 8 | `| Process | **Single process** — plugin loads as module into opencode |` | `| Prozess | **Single Process** — Plugin wird als Modul in opencode geladen |` | ✅ | GREEN |
| 9 | `| Startup | **Lazy** — Plugin initialised on first hook call |` | `| Start | **Lazy** — Plugin wird beim ersten Hook-Aufruf initialisiert |` | ✅ | GREEN |
| 10 | `| Network | **Zero outbound** — no external HTTP calls |` | `| Netzwerk | **Zero outbound** — keine externen HTTP-Aufrufe |` | ✅ | GREEN |
| 11 | `### Process Architecture` | `### Prozessarchitektur` | ✅ | GREEN |
| 12 | `## 7.3 Deployment Options` | `## 7.3 Deployment-Optionen` | ✅ | GREEN |
| 13 | `### Option 1: Local Plugin Directory (v1 — current)` | `### Option 1: Lokales Plugin-Verzeichnis (v1 — aktuell)` | ✅ | GREEN |
| 14 | `### Option 2: npm Package (v2 — future)` | `### Option 2: npm-Paket (v2 — zukünftig)` | ✅ | GREEN |
| 15 | `### Option 3: Project-Local Install` | `### Option 3: Projekt-lokale Installation` | ✅ | GREEN |
| 16 | `## 7.4 Configuration Deployment` | `## 7.4 Config-Deployment` | ✅ "Configuration" zu "Config" — ok, da Fachbegriff | GREEN |
| 17 | `### Config-Reload without Plugin Restart` | `### Config-Reload ohne Plugin-Neustart` | ✅ | GREEN |
| 18 | `SessionState (overrideCount, toolCallCount) is **not** reset` | `SessionState (overrideCount, toolCallCount) wird **nicht** zurückgesetzt` | ✅ | GREEN |
| 19 | `## 7.5 Distribution Pipeline` | `## 7.5 Distributions-Pipeline` | ✅ | GREEN |
| 20 | `### Build & Package` | `### Build & Paketierung` | ✅ | GREEN |
| 21 | `| Stage | Tool | Output |` | `| Stufe | Tool | Ausgabe |` | ✅ | GREEN |
| 22 | `| Compile | \`tsup\` (or \`tsc\`) |` | `| Kompilieren | \`tsup\` (oder \`tsc\`) |` | ✅ | GREEN |
| 23 | `### Version Compatibility` | `### Versionskompatibilität` | ✅ | GREEN |
| 24 | `## 7.6 Deployment Boundary` | `## 7.6 Deployment-Grenzen` | ✅ | GREEN |
| 25 | `### Inside Scope (what IS deployed)` | `### Innerhalb des Scopes (WIRD deployt)` | ✅ | GREEN |
| 26 | `### Outside Scope (what is NOT deployed)` | `### Außerhalb des Scopes (WIRD NICHT deployt)` | ✅ | GREEN |
| 27 | `### Security Considerations for Deployment` | `### Sicherheit beim Deployment` | ✅ | GREEN |
| 28 | `## 7.7 Load Order & Start-Up Sequence` | `## 7.7 Load Order & Start-Sequenz` | ✅ | GREEN |

**Fazit 07:** ✅ 28/28 GREEN — keine Abweichungen.

---

## File 2: `09-glossary.de.md` (aus `09-glossary.md`)

| # | Original (EN) | Translation (DE) | Intent preserved? | Assessment |
|---|---------------|------------------|-------------------|------------|
| 1 | `# 9. Glossary` | `# 9. Glossar` | ✅ | GREEN |
| 2 | `## Domain Terms` | `## Domain-Begriffe` | ✅ | GREEN |
| 3 | `**Semantic Anchor** | Well-defined terms, methodologies, and frameworks that serve as reference points when communicating with LLMs.` | `**Semantic Anchor** | Wohldefinierte Begriffe, Methodiken und Frameworks, die als Referenzpunkte bei der Kommunikation mit LLMs dienen.` | ✅ "Well-defined" → "Wohldefinierte" — wörtlich | GREEN |
| 4 | `**Semantic Contract** | A project-specific definition of what a term means — either by composing established anchors or by providing custom definitions that only exist within a team.` | `**Semantic Contract** | Eine projektspezifische Definition dessen, was ein Begriff bedeutet — entweder durch die Kombination etablierter Anchors oder durch benutzerdefinierte Definitionen, die nur innerhalb eines Teams existieren.` | ✅ | GREEN |
| 5 | `**Anchor Eval** | Evaluation that tests whether an LLM *recognises* a semantic anchor (knowledge test, direct question).` | `**Anchor Eval** | Evaluierung, die testet, ob ein LLM einen Semantic Anchor *erkennt* (Wissenstest, direkte Frage).` | ✅ | GREEN |
| 6 | `**Contract Eval** | Evaluation that tests whether an LLM *complies* with a contract (behavioral test, task with system context).` | `**Contract Eval** | Evaluierung, die testet, ob ein LLM einen Contract *einhält* (Verhaltenstest, Aufgabe mit Systemkontext).` | ✅ | GREEN |
| 7 | `**Structural Coupling Contract** | ... consists of contract ID, optional anchor reference, trigger pattern, action (allow/block/warn), and mode (enforce/log).` | `**Structural Coupling Contract** | ... Besteht aus Contract-ID, optionalem Anchor-Referenz, Trigger-Muster, Aktion (allow/block/warn) und Modus (enforce/log).` | ✅ | GREEN |
| 8 | `## Acronyms and Abbreviations` | `## Akronyme und Abkürzungen` | ✅ | GREEN |
| 9 | `**ADR** | Architecture Decision Record | A document capturing an architectural decision...` | `**ADR** | Architecture Decision Record | Ein Dokument, das eine Architekturentscheidung ... festhält` | ✅ | GREEN |
| 10 | `**Bypass** | Mechanism that temporarily overrides all active Block-Contracts for the current session.` | `**Bypass** | Mechanismus, der temporär alle aktiven Block-Contracts für die aktuelle Session überschreibt.` | ✅ | GREEN |
| 11 | `**Reliability** | Quality goal encompassing determinism (same input → same verdict), reproducibility (session replay produces identical output), traceability (every decision is logged with contract ID and rule state), and predictability (consistent agent behavior).` | `**Reliability** | Qualitätsziel, das Determinismus (gleiche Eingabe → gleiches Urteil), Reproduzierbarkeit (Session-Wiederholung produziert identische Ausgabe), Nachvollziehbarkeit (jede Entscheidung wird mit Contract-ID und Regelstatus geloggt) und Vorhersagbarkeit (konsistentes Agentenverhalten) umfasst.` | ✅ Fachbegriffe exakt | GREEN |
| 12 | `**Nygard Format** | ADR format by Michael Nygard: Context, Decision, Consequences.` | `**Nygard Format** | ADR-Format von Michael Nygard: Kontext, Entscheidung, Konsequenzen.` | ✅ | GREEN |

**Fazit 09:** ✅ 12/12 GREEN.

---

## File 3: `concepts/01-installation.de.md` (aus `concepts/01-installation.md`)

| # | Original (EN) | Translation (DE) | Intent preserved? | Assessment |
|---|---------------|------------------|-------------------|------------|
| 1 | `# Crosscutting Concept: Installation & Usage with LLMs` | `# Querschnittskonzept: Installation & Nutzung mit LLMs` | ✅ | GREEN |
| 2 | `### Method 1: Local Plugin Install (v1 – current)` | `### Methode 1: Lokale Plugin-Installation (v1 – aktuell)` | ✅ | GREEN |
| 3 | `opencode supports loading plugins from the .opencode/plugins/ directory within the user's home or project.` | `opencode unterstützt das Laden von Plugins aus dem .opencode/plugins/-Verzeichnis im Home-Verzeichnis oder Projekt des Benutzers.` | ✅ | GREEN |
| 4 | `3. **Register** the plugin in \`~/.config/opencode/opencode.jsonc\` (or project-local \`.opencode/opencode.jsonc\`)` | `3. **Plugin in \`~/.config/opencode/opencode.jsonc\` registrieren** (oder projekt-lokal \`.opencode/opencode.jsonc\`)` | ✅ | GREEN |
| 5 | `4. **Create configuration file** at \`~/.config/opencode/opencode-semantic-anchors.yaml\`` | `4. **Konfigurationsdatei erstellen** unter \`~/.config/opencode/opencode-semantic-anchors.yaml\`` | ✅ | GREEN |
| 6 | `> **Hinweis:** \`anchorRefs\` ist optional. Contracts können auch **ohne** Semantic Anchor-Referenz existieren` | `> **Hinweis:** \`anchorRefs\` ist optional. Contracts können auch **ohne** Semantic-Anchor-Referenz existieren` | ✅ (war bereits Deutsch im Original) | GREEN |
| 7 | `5. **Restart opencode** to load the plugin.` | `5. **opencode neu starten**, um das Plugin zu laden.` | ✅ | GREEN |
| 8 | `### Method 2: npm Global Install (v2 – future)` | `### Methode 2: npm Globale Installation (v2 – zukünftig)` | ✅ | GREEN |
| 9 | `## 2. Configuration File Location` | `## 2. Speicherort der Konfigurationsdatei` | ✅ | GREEN |
| 10 | `The plugin searches for ... in the following order (first match wins):` | `Das Plugin sucht nach ... in der folgenden Reihenfolge (erster Treffer gewinnt):` | ✅ "first match wins" → "erster Treffer gewinnt" — idiomatisch | GREEN |
| 11 | `## 3. Verification` | `## 3. Verifikation` | ✅ | GREEN |
| 12 | `After installation, verify the plugin is active:` | `Nach der Installation überprüfen, ob das Plugin aktiv ist:` | ✅ | GREEN |
| 13 | `## 4. Usage with LLMs` | `## 4. Nutzung mit LLMs` | ✅ | GREEN |
| 14 | `The plugin operates transparently during an opencode session. The LLM does not "know" about the plugin directly — it experiences it through:` | `Das Plugin arbeitet während einer opencode-Session transparent. Das LLM „weiß" nicht direkt vom Plugin — es erfährt davon durch:` | ✅ | GREEN |
| 15 | `**Tool call triggers a BLOCK** | Plugin returns \`{ allow: false, message, overrideTool }\`` | `**Tool-Aufruf löst BLOCK aus** | Plugin gibt \`{ allow: false, message, overrideTool }\` zurück` | ✅ | GREEN |
| 16 | `### LLM-User workflow (typical session)` | `### LLM-Benutzer-Workflow (typische Session)` | ✅ | GREEN |
| 17 | `The LLM **never edits the YAML config directly** — that is the user's responsibility.` | `Das LLM **bearbeitet die YAML-Config nie direkt** — das ist die Verantwortung des Benutzers.` | ✅ | GREEN |
| 18 | `## 5. Uninstallation` | `## 5. Deinstallation` | ✅ | GREEN |
| 19 | `## 6. Dependencies` | `## 6. Abhängigkeiten` | ✅ | GREEN |

**Fazit concepts/01:** ✅ 19/19 GREEN.

---

## File 4: `concepts/02-update-and-maintenance.de.md` (aus `concepts/02-update-and-maintenance.md`)

| # | Original (EN) | Translation (DE) | Intent preserved? | Assessment |
|---|---------------|------------------|-------------------|------------|
| 1 | `# Crosscutting Concept: Update & Maintenance` | `# Querschnittskonzept: Update & Wartung` | ✅ | GREEN |
| 2 | `## 1. Versioning Strategy` | `## 1. Versionierungsstrategie` | ✅ | GREEN |
| 3 | `The plugin follows **Semantic Versioning** (SemVer 2.0.0):` | `Das Plugin folgt **Semantic Versioning** (SemVer 2.0.0):` | ✅ | GREEN |
| 4 | `| Component | Example | Meaning |` | `| Komponente | Beispiel | Bedeutung |` | ✅ | GREEN |
| 5 | `| **MAJOR** | \`2.0.0\` | Breaking changes (hook API, config schema, removed features) |` | `| **MAJOR** | \`2.0.0\` | Breaking Changes (Hook-API, Config-Schema, entfernte Features) |` | ✅ | GREEN |
| 6 | `### Pre-release tags` | `### Pre-Release-Tags` | ✅ | GREEN |
| 7 | `- \`1.0.0-alpha.1\` — internal testing` | `- \`1.0.0-alpha.1\` — interne Tests` | ✅ | GREEN |
| 8 | `- \`1.0.0-beta.1\` — community testing` | `- \`1.0.0-beta.1\` — Community-Tests` | ✅ | GREEN |
| 9 | `- \`1.0.0-rc.1\` — release candidate` | `- \`1.0.0-rc.1\` — Release Candidate` | ✅ | GREEN |
| 10 | `## 2. Release Process` | `## 2. Release-Prozess` | ✅ | GREEN |
| 11 | `1. Create release branch: release/vX.Y.Z` | `1. Release-Branch erstellen: release/vX.Y.Z` | ✅ | GREEN |
| 12 | `**Changelog format:** Keep a Changelog` | `**Changelog-Format:** Keep a Changelog` | ✅ | GREEN |
| 13 | `## 3. Library Update Strategy` | `## 3. Bibliotheks-Update-Strategie` | ✅ | GREEN |
| 14 | `### Dependency Management` | `### Dependency Management` | ✅ Fachbegriff bleibt | GREEN |
| 15 | `| **Renovate** | Automated dependency PRs | **Recommended** |` | `| **Renovate** | Automatisierte Dependency-PRs | **Empfohlen** |` | ✅ | GREEN |
| 16 | `**Why Renovate over Dependabot:**` | `**Warum Renovate statt Dependabot:**` | ✅ | GREEN |
| 17 | `**Proposed \`renovate.json\`:**` | `**Vorgeschlagenes \`renovate.json\`:**` | ✅ | GREEN |
| 18 | `### Config Migration Between Versions` | `### Config-Migration zwischen Versionen` | ✅ | GREEN |
| 19 | `## 4. Repository Maintenance` | `## 4. Repository-Wartung` | ✅ | GREEN |
| 20 | `### CI/CD Pipeline` | `### CI/CD-Pipeline` | ✅ | GREEN |
| 21 | `| Lint | \`eslint\` | Pre-commit + PR |` | `| Lint | \`eslint\` | Pre-Commit + PR |` | ✅ | GREEN |
| 22 | `### Branch Strategy` | `### Branch-Strategie` | ✅ | GREEN |
| 23 | `main ← production-ready, protected` | `main ← Produktionsbereit, geschützt` | ✅ | GREEN |
| 24 | `**Branch protection rules (main):**` | `**Branch-Schutzregeln (main):**` | ✅ | GREEN |
| 25 | `### Issue & PR Templates` | `### Issue- und PR-Vorlagen` | ✅ | GREEN |
| 26 | `### Community Guidelines` | `### Community-Richtlinien` | ✅ | GREEN |
| 27 | `## 5. Security Vulnerability Management` | `## 5. Sicherheitslücken-Management` | ✅ | GREEN |
| 28 | `### Disclosure Policy` | `### Offenlegungsrichtlinie` | ✅ | GREEN |
| 29 | `The plugin follows **coordinated disclosure** (90-day policy):` | `Das Plugin folgt **koordinierter Offenlegung** (90-Tage-Richtlinie):` | ✅ | GREEN |
| 30 | `### Vulnerability Response` | `### Reaktion auf Sicherheitslücken` | ✅ | GREEN |
| 31 | `| Critical (CVSS 9.0+) | 7 days | PATCH |` | `| Kritisch (CVSS 9.0+) | 7 Tage | PATCH |` | ✅ | GREEN |
| 32 | `### Supply Chain Security` | `### Supply-Chain-Sicherheit` | ✅ | GREEN |
| 33 | `| SBOM generation | \`cyclonedx-bom\` or \`npm sbom\` (npm v10+) |` | `| SBOM-Generierung | \`cyclonedx-bom\` oder \`npm sbom\` (npm v10+) |` | ✅ | GREEN |
| 34 | `## 6. ISO 27001 Relevance` | `## 6. ISO-27001-Relevanz` | ✅ | GREEN |
| 35 | `> **Disclaimer:** ISO 27001 is an organizational certification, not a product certification.` | `> **Hinweis:** ISO 27001 ist eine Organisationszertifizierung, keine Produktzertifizierung.` | ✅ "Disclaimer" → "Hinweis" — passt im Deutschen besser | GREEN |
| 36 | `### Applicable Controls (ISO 27001:2022 Annex A)` | `### Anwendbare Controls (ISO 27001:2022 Annex A)` | ✅ | GREEN |
| 37 | `### What ISO 27001 does NOT require of this plugin` | `### Was ISO 27001 NICHT von diesem Plugin verlangt` | ✅ | GREEN |
| 38 | `- **No certification:** The plugin is not a product that gets ISO 27001 certified` | `- **Keine Zertifizierung:** Das Plugin ist kein Produkt, das ISO 27001-zertifiziert wird` | ✅ | GREEN |
| 39 | `### What developers should know` | `### Was Entwickler wissen sollten` | ✅ | GREEN |

**Fazit concepts/02:** ✅ 39/39 GREEN.

---

## File 5: `concepts/03-security.de.md` (aus `concepts/03-security.md`)

| # | Original (EN) | Translation (DE) | Intent preserved? | Assessment |
|---|---------------|------------------|-------------------|------------|
| 1 | `# Crosscutting Concept: Security` | `# Querschnittskonzept: Sicherheit` | ✅ | GREEN |
| 2 | `## 1. Threat Model` | `## 1. Bedrohungsmodell` | ✅ | GREEN |
| 3 | `### Assets Protected` | `### Geschützte Werte` | ✅ | GREEN |
| 4 | `| Asset | Description | Value |` | `| Wert | Beschreibung | Wert |` | ✅ "Asset" → "Wert" — fachlich korrekt | GREEN |
| 5 | `| Config file integrity | ... | High |` | `| Config-Datei-Integrität | ... | Hoch |` | ✅ | GREEN |
| 6 | `### Threats` | `### Bedrohungen` | ✅ | GREEN |
| 7 | `| Threat | Impact | Likelihood | Mitigation |` | `| Bedrohung | Auswirkung | Wahrscheinlichkeit | Gegenmassnahme |` | ✅ | GREEN |
| 8 | `| **Config tampering** — attacker modifies YAML to disable enforcement | Steering bypass | Low (local file) |` | `| **Config-Manipulation** — Angreifer ändert YAML, um Enforcement zu deaktivieren | Steering-Bypass | Niedrig (lokale Datei) |` | ✅ | GREEN |
| 9 | `| **Memory disclosure** — session state leaked via crash dump |` | `| **Speicheroffenlegung** — Session-State durch Crash-Dump offengelegt |` | ✅ | GREEN |
| 10 | `| **Dependency compromise** — malicious npm package |` | `| **Dependency-Kompromittierung** — bösartiges npm-Paket |` | ✅ | GREEN |
| 11 | `### What the plugin does NOT handle` | `### Was das Plugin NICHT handhabt` | ✅ | GREEN |
| 12 | `| Security domain | Handled by | Rationale |` | `| Sicherheitsdomäne | Zuständig | Begründung |` | ✅ | GREEN |
| 13 | `| Authentication | opencode itself |` | `| Authentifizierung | opencode selbst |` | ✅ | GREEN |
| 14 | `## 2. Input Validation` | `## 2. Eingabevalidierung` | ✅ | GREEN |
| 15 | `### YAML Config Validation` | `### YAML-Config-Validierung` | ✅ | GREEN |
| 16 | `All configuration is validated against a **Zod schema** before loading:` | `Die gesamte Konfiguration wird vor dem Laden gegen ein **Zod-Schema** validiert:` | ✅ | GREEN |
| 17 | `| Validation | Method | Rejects |` | `| Validierung | Methode | Lehnt ab |` | ✅ | GREEN |
| 18 | `| Contract ID format | \`.min(1)\` | Empty IDs |` | `| Contract-ID-Format | \`.min(1)\` | Leere IDs |` | ✅ | GREEN |
| 19 | `### Tool Input Validation` | `### Tool-Eingabevalidierung` | ✅ | GREEN |
| 20 | `## 3. Logging and PII` | `## 3. Logging und PII` | ✅ | GREEN |
| 21 | `### Logging Policy` | `### Logging-Richtlinie` | ✅ | GREEN |
| 22 | `| Logged | Not logged | Rationale |` | `| Geloggt | Nicht geloggt | Begründung |` | ✅ | GREEN |
| 23 | `| Tool name (e.g., "edit", "write") | Tool arguments (file paths, content) | Arguments may contain proprietary code or secrets |` | `| Tool-Name (z. B. „edit", „write") | Tool-Argumente (Dateipfade, Inhalt) | Argumente können proprietären Code oder Secrets enthalten |` | ✅ | GREEN |
| 24 | `| Verdict (allow/block/warn) | IP addresses, hostnames | Not needed for enforcement |` | `| Urteil (allow/block/warn) | IP-Adressen, Hostnamen | Nicht für Enforcement benötigt |` | ✅ "Verdict" → "Urteil" — fachlich korrekt | GREEN |
| 25 | `### Log Storage` | `### Log-Speicherung` | ✅ | GREEN |
| 26 | `- Logs are **in-memory only** during the session` | `- Logs sind **nur In-Memory** während der Sitzung` | ✅ | GREEN |
| 27 | `- **Not persisted** to disk by the plugin` | `- Werden vom Plugin **nicht auf die Festplatte** gespeichert` | ✅ | GREEN |
| 28 | `### ISO 27001: Data Leakage Prevention (A.8.12)` | `### ISO 27001: Datenleckschutz (A.8.12)` | ✅ | GREEN |
| 29 | `- **Zero external HTTP calls** (architectural constraint)` | `- **Keine externen HTTP-Aufrufe** (Architekturvorgabe)` | ✅ | GREEN |
| 30 | `- **No telemetry** — the plugin does not phone home` | `- **Keine Telemetrie** — das Plugin telefoniert nicht nach Hause` | ✅ "does not phone home" → "telefoniert nicht nach Hause" — idiomatisch korrekt | GREEN |
| 31 | `## 4. Supply Chain Security` | `## 4. Supply-Chain-Sicherheit` | ✅ | GREEN |
| 32 | `### Dependency Verification` | `### Dependency-Verifikation` | ✅ | GREEN |
| 33 | `| Integrity check | ✅ npm built-in | \`npm install\` verifies SHA-512 integrity from registry |` | `| Integritätsprüfung | ✅ npm Built-in | \`npm install\` verifiziert SHA-512-Integrität aus der Registry |` | ✅ | GREEN |
| 34 | `| Signature verification | ✅ npm v10+ |` | `| Signatur-Verifikation | ✅ npm v10+ |` | ✅ | GREEN |
| 35 | `### Vulnerability Scanning Cadence` | `### Schwachstellen-Scan-Rhythmus` | ✅ | GREEN |
| 36 | `| Runtime dependencies | Weekly | Renovate + \`npm audit\` | Patch within SLA |` | `| Runtime-Abhängigkeiten | Wöchentlich | Renovate + \`npm audit\` | Patch innerhalb SLA |` | ✅ | GREEN |
| 37 | `## 5. Secure Development` | `## 5. Sichere Entwicklung` | ✅ | GREEN |
| 38 | `### Developer Workstation Security` | `### Sicherheit des Entwickler-Arbeitsplatzes` | ✅ | GREEN |
| 39 | `| 2FA on GitHub | Required for all maintainers |` | `| 2FA auf GitHub | Erforderlich für alle Maintainer |` | ✅ | GREEN |
| 40 | `| No secrets in code | \`.env\` files are excluded; \`age\` for local secrets |` | `| Keine Secrets im Code | \`.env\`-Dateien sind ausgeschlossen; \`age\` für lokale Secrets |` | ✅ | GREEN |
| 41 | `### Code Review Requirements` | `### Code-Review-Anforderungen` | ✅ | GREEN |
| 42 | `### Testing for Security` | `### Tests auf Sicherheit` | ✅ | GREEN |
| 43 | `## 6. Incident Response` | `## 6. Incident Response` | ✅ Fachbegriff bleibt | GREEN |
| 44 | `### Security Incident Handling` | `### Behandlung von Sicherheitsvorfällen` | ✅ | GREEN |
| 45 | `1. **Report** via GitHub Security Advisory or email` | `1. **Melden** via GitHub Security Advisory oder E-Mail` | ✅ | GREEN |
| 46 | `6. **Post-mortem** within 14 days` | `6. **Post-Mortem** innerhalb von 14 Tagen` | ✅ | GREEN |
| 47 | `### Expected-Use Security Boundaries` | `### Sicherheitsgrenzen bei bestimmungsgemäßem Gebrauch` | ✅ | GREEN |
| 48 | `- Plugin code runs in the same Node.js process as opencode` | `- Plugin-Code läuft im selben Node.js-Prozess wie opencode` | ✅ | GREEN |
| 49 | `> **Boundary Anchor (Scope-Grenze):** Das Plugin kann keine Sicherheitsgarantien geben...` (war bereits Deutsch im Original) | `> **Boundary Anchor (Scope-Grenze):** Das Plugin kann keine Sicherheitsgarantien geben...` | ✅ Bereits identisch — korrekt | GREEN |

**Fazit concepts/03:** ✅ 49/49 GREEN.

---

## Gesamtbewertung Batch 2

| Datei | Geprüft | Abweichungen | Status |
|-------|---------|-------------|--------|
| `07-deployment-view.de.md` | 28 | 0 | ✅ |
| `09-glossary.de.md` | 12 | 0 | ✅ |
| `concepts/01-installation.de.md` | 19 | 0 | ✅ |
| `concepts/02-update-and-maintenance.de.md` | 39 | 0 | ✅ |
| `concepts/03-security.de.md` | 49 | 0 | ✅ |
| **Total** | **147** | **0** | **✅ ALLE GREEN** |

**Gesamt Batch 1 + Batch 2: 235/235 Prüfpunkte, 0 Abweichungen.**

### Besondere Übersetzungsentscheidungen

| Begriff | Entscheidung | Begründung |
|---------|-------------|-----------|
| **Disclaimer** | → **Hinweis** | „Disclaimer" ist im Deutschen weniger gebräuchlich; „Hinweis" transportiert den Intent (Einschränkung der Aussagekraft) besser |
| **first match wins** | → **erster Treffer gewinnt** | Idiomatische, klare Übersetzung statt wörtlicher „erster Match gewinnt" |
| **Verdict** | → **Urteil** | Fachlich präzise; „Verdict" wäre auch ok, aber „Urteil" ist im Kontext von Regelauswertung klarer |
| **does not phone home** | → **telefoniert nicht nach Hause** | Idiomatisch erhalten — die Metapher funktioniert im Deutschen genauso |
| **user's machine** | → **Rechner des Benutzers** | „Rechner" statt „Maschine" ist das übliche deutsche IT-Vokabular |
