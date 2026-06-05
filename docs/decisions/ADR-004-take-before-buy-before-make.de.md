# ADR-004: Take before Buy before Make als Entwicklungsparadigma

## Status
Accepted

## Context
Bei der Entwicklung des Plugins gibt es zwei mögliche Ansätze:

1. **Build from scratch** — Alles selbst schreiben, maximale Kontrolle
2. **Take before Buy before Make** — Existierende Lösungen prüfen, übernehmen (Take), integrieren (Buy), oder erst dann Eigenentwicklung (Make)

Das LLM-Coding/Semantic-Anchors Repository selbst definiert dieses Prinzip als methodischen Anspruch. Es ist aber keine "leere" Regel — sie muss konkret angewandt werden.

Die Frage: Soll das Plugin-Entwicklungsteam (wir) dieses Prinzip als verbindliches Entwicklungsparadigma übernehmen? Und wenn ja, mit welcher Verbindlichkeit?

## Alternatives Considered

### Option A: Build from Scratch
Alles selbst programmieren, keine externen Abhängigkeiten ausser dem opencode Plugin SDK.

**Vorteile:**
- Volle Kontrolle über Codebasis
- Keine externen Abhängigkeiten (ausser SDK)
- Maximale Flexibilität bei Design-Entscheidungen
- Keine Lizenzkonflikte

**Nachteile:**
- **Dupliziert existierende Arbeit** — andere Projekte haben ähnliche Probleme gelöst
- **Erhöhtes Risiko** — bekannte Fallstricke werden übersehen
- Kein Alignment mit dem Ecosystem
- Höherer Entwicklungsaufwand

### Option B: Take before Buy before Make (gewählt)
Bevor Code geschrieben wird, wird systematisch geprüft:

1. **Take** — Existiert etwas, das wir direkt nutzen können?
   - opencode Plugin SDK (take: nutzen wir direkt)
   - Semantic-Anchors Terminologie (take: übernehmen wir)

2. **Buy** — Können wir eine OpenSource-Komponente integrieren?
   - `agentcontract/spec` Terminologie & YAML-Format (buy: übernehmen das Format)
   - `js-yaml` für YAML-Parsing (buy: nutzen wir direkt)
   - `zod` für Schema-Validierung (buy: nutzen wir direkt)

3. **Make** — Eigenentwicklung nur für den opencode-spezifischen Teil:
   - Plugin-Hooks (opencode-spezifisch — kein existierendes Plugin)
   - RuleEngine mit Contract-Evaluierung
   - Bypass-Mechanismus
   - Config-Loader mit Role-Presets

**Vorteile:**
- **Vermeidet "Not invented here"-Syndrom**
- Reduziert Entwicklungszeit (take/buy > make)
- Nutzt bewährte Komponenten (zod, js-yaml sind mature)
- Alignment mit Ecosystem (agentcontract/spec, Semantic-Anchors)
- Open-Source-Lizenzen sind kompatibel (MIT)

**Nachteile:**
- Abhängigkeit von Drittanbietern (Updates, Security, Breaking Changes)
- Muss bei jeder Feature-Entwicklung den Take-Buy-Make-Check durchführen (Prozesskosten)
- Geringere Kontrolle über Drittkomponenten

### Option C: Hybrid — Take/Buy ohne formellen Prozess
Grundsätzlich existierende Lösungen nutzen, aber ohne formellen Check vor jeder Entscheidung.

**Nachteile:**
- Informeller Prozess wird in der Praxis oft übersprungen
- Entscheidungen werden inkonsistent getroffen
- Bei Zeitdruck wird eher "Make" gewählt
- Ohne Dokumentation der Take/Buy-Checks ist nicht nachvollziehbar, warum etwas selbst gebaut wurde

## Evaluation Criteria
| Kriterium | Gewicht | Beschreibung |
|-----------|---------|--------------|
| Entwicklungsgeschwindigkeit | Hoch | Schneller zu nutzenden Code übernehmen |
| Wartbarkeit | Hoch | Weniger eigener Code = weniger Wartung |
| Ecosystem-Alignment | Mittel | Kompatibilität mit Agent-Standards |
| Abhängigkeitsrisiko | Mittel | Externe Dependencies = Update-Pflicht |
| Prozesskosten | Niedrig | Formeller Check vor jeder Entscheidung |

## Decision
**Option B: Take before Buy before Make** wurde als verbindliches Entwicklungsparadigma gewählt.

Begründung:
- Das Semantic-Anchors-Repository definiert es selbst als methodischen Anspruch
- Reduziert Entwicklungszeit signifikant (zod, js-yaml, agentcontract/spec sind ready)
- "Buy"-Komponenten sind MIT-lizenziert (kompatibel mit Contribution-Pfad)
- Der formelle Check wird im Design-Dokument an jeder relevanten Stelle dokumentiert (Source Anchor)
- Für das Plugin konkret: Take (opencode SDK) → Buy (zod, js-yaml, agentcontract/spec Format) → Make (RuleEngine, Hooks, Config-Loader)

## Applied Take-Buy-Make Analysis

Bevor wir eigene Entwicklung gestartet haben, wurden folgende existierende Projekte systematisch geprüft. Für jedes Projekt wurde dokumentiert, warum es Take, Buy oder Make ist:

### 1. `agentcontract/spec`
- **Art:** Spezifikation für Agent Contracts (YAML, Pre/Postconditions, CI-Gating)
- **Bewertung:** Buy (Terminologie + Format)
- **Warum nicht adaptiert/forked:** Es ist eine Spezifikation, keine Implementation. Es gibt kein ausführbares Plugin, das wir für opencode hätten übernehmen können. Wir übernehmen das YAML-Format und die Vertrags-Terminologie, bauen aber die opencode-spezifische Hook-Integration selbst (Make).
- **Contribution:** Unser YAML-Schema ist kompatibel genug, um später in agentcontract/spec als opencode-Profile eingebracht zu werden.

### 2. Kiros `/steering`
- **Art:** Runtime Steering Files (proprietär)
- **Bewertung:** Take (Inspiration)
- **Warum nicht adaptiert/forked:** Kiros ist ein proprietäres, anderes Agent-Tool. Das `/steering`-Konzept ist fest in Kiros' Architektur verwoben. Eine Extraktion für opencode wäre ein Redesign — nicht weniger Aufwand als ein Make. Wir nehmen die Idee (runtime steering = YAML-Datei beeinflusst Agent-Verhalten) als Inspiration.
- **Contribution:** Nicht möglich (proprietär).

### 3. Semantic-Anchors Onboarding Skill
- **Art:** Claude Code Plugin (installiert Anchor-Blöcke in AGENTS.md)
- **Bewertung:** Take (Konzept)
- **Warum nicht adaptiert/forked:** Dieses Plugin ist für Claude Code (andere Plattform) und prompt-basiert (nicht hook-enforced). Ein Rewrite für opencode wäre ein Make, kein Adapt. Wir nehmen die Idee der rollenbasierten Presets als Inspiration.
- **Contribution:** Unser Plugin wird als `plugins/opencode-semantic-anchors/` in das gleiche Semantic-Anchors-Repository eingebracht — als opencode-Pendant zum Claude Code Plugin unter `plugins/semantic-anchors/`.

### 4. `gl0bal01/contract-agents`
- **Art:** AGENTS_CONTRACT.md mit Agent-Rollen (prompt-basiert)
- **Bewertung:** Take (Referenz)
- **Warum nicht adaptiert/forked:** Rein prompt-basiert — kein Runtime-Enforcement. Der Mechanismus (Markdown-Datei mit Rollendefinitionen) ist nicht auf opencode-Hooks übertragbar. Wir nehmen die Idee der Rollen-basierten Konfiguration als Referenz.
- **Contribution:** Keine direkte Contribution möglich.

### 5. SpecAnchor
- **Art:** Three-Tier Spec-System mit Drift Detection
- **Bewertung:** Take (Referenz)
- **Warum nicht adaptiert/forked:** Keine opencode-Integration. SpecAnchor fokussiert auf Spezifikations-Drift über Zeit, nicht auf Runtime-Steering. Zielsetzung ist eine andere.
- **Contribution:** Keine direkte Contribution möglich.

### 6. opencode Plugin SDK (Take)
- Direkt genutzt. Kein Make nötig.

### 7. Zod + js-yaml (Buy)
- Als Runtime-Dependencies integriert. Kein Make nötig.

### 8. RuleEngine, Hooks, Config-Loader (Make)
- **Eigenentwicklung**, weil:
  - Kein existierendes Projekt bietet runtime Enforcement inside opencode's Plugin-System
  - Alle existierenden Lösungen sind prompt-basiert, plattform-spezifisch oder Spezifikationen ohne Implementation
  - Die Kombination aus Hook-Enforcement + Structural Coupling Contract + opencode-spezifischem Config-Format existiert nirgendwo

### Fazit der Analyse
Das Plugin füllt eine **echte Lücke** — keine der existierenden Lösungen deckt runtime Enforcement via opencode Plugin Hooks ab. Der Make-Anteil ist auf den opencode-spezifischen Kern beschränkt; Take und Buy decken den Rest ab.

## Consequences
- **Positiv:** Vermeidet Duplikation existierender Lösungen
- **Positiv:** Nutzt mature, getestete Bibliotheken (zod, js-yaml)
- **Positiv:** Alignment mit dem Agent-Contract-Ecosystem
- **Negativ:** Externe Dependencies erfordern Update-Management (Renovate, npm audit)
- **Negativ:** Jede neue Dependency muss auf Lizenzkompatibilität geprüft werden
- **Negativ:** Prozesskosten bei jeder Feature-Entwicklung (kurzer Check, aber formal)
- **Trade-off:** Weniger Eigenbau-Kontrolle gegen schnellere, sichere Entwicklung

## Related
- Entscheidung 4 in 04-solution-strategy.md
- 02-architecture-constraints.md (Process Constraints)
- 03-system-scope-and-context.md (Take before Buy before Make Check)
- docs/concepts/02-update-and-maintenance.md (Dependency Management, Renovate)

## Sources
- LLM-Coding/Semantic-Anchors — Repo: https://github.com/LLM-Coding/Semantic-Anchors
- AgentContract Specification: https://github.com/agentcontract/spec/blob/main/SPEC.md
- Zod: https://zod.dev/
- js-yaml: https://github.com/nodeca/js-yaml
- opencode Plugin SDK: https://opencode.ai/docs/plugins
