# Mitwirken an opencode-semantic-anchors

Vielen Dank, dass du einen Beitrag leisten möchtest. Dieses Dokument beschreibt die Projektstruktur, die Entwicklungsorganisation und die effektive Mitwirkung — in **deutscher oder englischer Sprache**.

> **🇬🇧 English version:** [`CONTRIBUTING.md`](CONTRIBUTING.md)

---

## Projektübersicht

`opencode-semantic-anchors` ist ein [opencode](https://opencode.ai)-Plugin, das **Runtime-Steering** für LLM-Agenten bereitstellt. Es erzwingt Verhaltensregeln (Anchors, Contracts, Step Confirmations) über Plugin-Hooks — ohne LLM-Context-Tokens zu verbrauchen.

Das Plugin ist als **Contribution an das [LLM-Coding/Semantic-Anchors](https://github.com/LLM-Coding/Semantic-Anchors)**-Repository konzipiert (siehe [ADR-005](docs/decisions/ADR-005-repository-strategy.de.md) für die Standalone-Repo-Strategie mit Cross-Links).

### Design-Ansatz

Die Architektur wird mit der [arc42](https://arc42.org)-Vorlage dokumentiert. Alle Dokumente sind zweisprachig verfügbar:

| Sektion | Englisch | Deutsch |
|---------|----------|---------|
| Introduction & Goals | [`01-introduction-and-goals.md`](docs/01-introduction-and-goals.md) | [`01-introduction-and-goals.de.md`](docs/01-introduction-and-goals.de.md) |
| Architecture Constraints | [`02-architecture-constraints.md`](docs/02-architecture-constraints.md) | [`02-architecture-constraints.de.md`](docs/02-architecture-constraints.de.md) |
| System Scope & Context | [`03-system-scope-and-context.md`](docs/03-system-scope-and-context.md) | [`03-system-scope-and-context.de.md`](docs/03-system-scope-and-context.de.md) |
| Solution Strategy | [`04-solution-strategy.md`](docs/04-solution-strategy.md) | [`04-solution-strategy.de.md`](docs/04-solution-strategy.de.md) |
| Building Block View | [`05-building-block-view.md`](docs/05-building-block-view.md) | [`05-building-block-view.de.md`](docs/05-building-block-view.de.md) |
| Runtime View | [`06-runtime-view.md`](docs/06-runtime-view.md) | [`06-runtime-view.de.md`](docs/06-runtime-view.de.md) |
| Deployment View | [`07-deployment-view.md`](docs/07-deployment-view.md) | [`07-deployment-view.de.md`](docs/07-deployment-view.de.md) |
| Quality Requirements | [`08-quality-requirements.md`](docs/08-quality-requirements.md) | [`08-quality-requirements.de.md`](docs/08-quality-requirements.de.md) |
| Glossary | [`09-glossary.md`](docs/09-glossary.md) | [`09-glossary.de.md`](docs/09-glossary.de.md) |

Architekturentscheidungen werden als **ADRs (Architecture Decision Records)** in [`docs/decisions/`](docs/decisions/) festgehalten. Crosscutting Concepts in [`docs/concepts/`](docs/concepts/).

---

## Entwicklungsphasen

Das Projekt wird in **5 Phasen** entwickelt, abgebildet als GitHub-Meilensteine:

| Meilenstein | Ziel |
|------------|------|
| **Phase 1: Design** | Vollständige arc42-Architekturdokumentation und ADRs. Alle Design-Entscheidungen geprüft und freigegeben. |
| **Phase 2: Prototyp** | Kern-Plugin implementieren: RuleEngine, `tool.execute.before`-Hook, YAML-Config-Loader, `/anchor bypass`- und `/anchor status`-Tools. |
| **Phase 3: Erweiterung** | Source-Anchor-Enforcement, Rollen-basierte Presets, Config-Reload-Tool. |
| **Phase 4: Tests & Doku** | Unit-Tests (vitest), Integrationstests, README, npm-Paket. |
| **Phase 5: Contribution** | PR an LLM-Coding/Semantic-Anchors, npm publish. |

---

## Issues: Namenskonventionen und Labels

Issues können auf **Deutsch oder Englisch** erstellt werden. Beide Sprachen sind gleich willkommen.

### Issue-Titel-Konvention

Titel folgen dem Muster **`[Kategorie]: Spezifische Beschreibung`** — konsistent mit der Konvention im Upstream-Semantic-Anchors-Repository:

| Kategorie | Wann verwenden | Beispiel |
|-----------|---------------|----------|
| `[Design]` | Rückmeldung zu arc42-Sektionen, Architekturentscheidungen | `[Design]: Context Efficiency als Qualitätsziel ergänzen` |
| `[Feature]` | Neues Feature oder Fähigkeit | `[Feature]: Rollenbasierte Presets für Entwickler/Admin/Reviewer` |
| `[Bug]` | Fehler oder unerwartetes Verhalten | `[Bug]: Config-Loader stürzt bei leerer YAML-Datei ab` |
| `[Docs]` | Dokumentationsverbesserungen, Übersetzungen | `[Docs]: Deutsche Übersetzung von 05-building-block-view.md` |
| `[Proposal]` | Offener Vorschlag zur Diskussion | `[Proposal]: Unterstützung für benutzerdefinierte Trigger-Patterns` |
| `[Question]` | Klärungsfrage oder How-to | `[Question]: Wie interagieren Contracts mit mehreren Plugins?` |

**Beispiele aus dem Upstream-Repo** (LLM-Coding/Semantic-Anchors):

```
[Role Taxonomy Proposal]: Cross-Cutting Governance Roles
[Category Proposal]: AI Ethics & Governance
[Framework Proposal]: Structural Coupling Contract + System-Theoretic Semantic Anchors
[Metadata Proposal]: Systemic & Human dimensions as optional anchor metadata
```

### Issue-Labels

| Label | Farbe | Beschreibung |
|-------|-------|-------------|
| `design` | 🔵 blau | Design-Entscheidungen, arc42-Dokumentation |
| `enhancement` | 🟢 grün | Feature-Anfragen |
| `bug` | 🔴 rot | Fehler |
| `docs` | ⚪ grau | Dokumentation |
| `question` | 🟣 lila | Klärungsbedarf |
| `phase-1` | `—` | Design-Phase |
| `phase-2` | `—` | Prototyp-Phase |
| `phase-3` | `—` | Erweiterungs-Phase |
| `phase-4` | `—` | Tests & Doku-Phase |
| `phase-5` | `—` | Contribution-Phase |
| `good-first-issue` | 🟡 gelb | Geeignet für neue Mitwirkende |

### Source Anchor in Issues

Jedes Issue, das ein Problem beschreibt oder eine Lösung vorschlägt, muss dem [Source Anchor](https://github.com/LLM-Coding/Semantic-Anchors)-Prinzip folgen: jede Behauptung muss durch eine wörtlich zitierte, referenzierte Quelle belegbar sein. Dies gilt unabhängig von der Sprache.

---

## Pull Requests

### Arbeitsablauf

1. Forke das Repository und erstelle einen Feature-Branch von `main`:
   ```
   git checkout -b <kategorie>/<beschreibung>
   ```
2. Nimm deine Änderungen vor. Siehe [Sprachkonventionen](#sprachkonventionen) für die zweisprachige Dokumentation.
3. Stelle sicher, dass die Tests bestehen (siehe [Build und Tests](#build-und-tests)).
4. Erstelle einen Pull Request gegen `main`.
5. Alle PRs benötigen mindestens eine Review vor dem Merge.

### Branch-Namen

| Muster | Zweck |
|--------|-------|
| `feat/*` | Neues Feature |
| `fix/*` | Bug-Fix |
| `docs/*` | Nur Dokumentationsänderungen (EN) |
| `docs-de/*` | Deutsche Dokumentationsänderungen |
| `refactor/*` | Refactoring ohne Funktionsänderung |
| `test/*` | Nur Test-Änderungen |

### Commit-Nachrichten

Wir folgen [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.

**Für zweisprachige Dokumentationsänderungen** den `docs`-Typ mit der Sektion als Scope verwenden:

```
docs(05-building-block-view): deutsche Übersetzung hinzugefügt
```

### Code-Review-Checkliste

Jeder PR wird geprüft auf:

- **Funktionale Korrektheit** — macht der Code, was er behauptet?
- **Design-Compliance** — folgt er der arc42-Architektur?
- **Source-Anchor-Compliance** — sind Behauptungen belegbar?
- **Zweisprachige Dokumentation** — sind EN- und DE-Versionen aktualisiert? (siehe [Sprachkonventionen](#sprachkonventionen))
- **Testabdeckung** — gibt es einen Test für die Änderung?

---

## Sprachkonventionen

Die Dokumentation ist **zweisprachig (Englisch + Deutsch)**, entsprechend der Upstream-Semantic-Anchors-Konvention:

| Sprache | Datei-Suffix | Beispiel |
|---------|-------------|----------|
| Englisch (Primär) | `.md` | `01-introduction-and-goals.md` |
| Deutsch (parallel) | `.de.md` | `01-introduction-and-goals.de.md` |
| Englisch (nach Contribution) | `.adoc` | `01-introduction-and-goals.adoc` |
| Deutsch (nach Contribution) | `.de.adoc` | `01-introduction-and-goals.de.adoc` |

### Übersetzungsprinzip (Literal mit Intent-Resolve)

1. **Wörtlich** — so nah wie möglich am Original übersetzen, keine Paraphrasen.
2. **Bei Mehrdeutigkeit** — die Übersetzung wählen, die den *Intent* und die *fachliche Korrektheit* am besten abbildet, nicht die wörtlichste.
3. **Fachbegriffe bleiben unübersetzt** — `RuleEngine`, `tool.execute.before`, `Fail-Open`, `Bypass`, `Steering Contract`, `Hook`.
4. **Nachvollziehbarkeit** — jede Übersetzung muss per Git-Diff prüfbar sein. Keine stillschweigenden Inhaltsänderungen.
5. **Issues und PRs** können auf Deutsch oder Englisch verfasst werden — keine Übersetzung für die Diskussion erforderlich.

Siehe [ADR-012](docs/decisions/ADR-012-bilingual-documentation.de.md) und [`docs/concepts/04-language-and-translation.de.md`](docs/concepts/04-language-and-translation.de.md) für Details.

---

## Build und Tests

```bash
# Abhängigkeiten installieren
npm install

# Plugin bauen
npm run build

# Tests ausführen
npm test

# Tests mit Coverage
npm run test:coverage

# Lint
npm run lint
```

### Test-Struktur

```
src/
├── config/
│   ├── __tests__/
│   │   └── loader.test.ts          # Unit-Tests
│   └── __fixtures__/               # Test-YAML-Dateien
├── rules/
│   ├── __tests__/
│   │   ├── engine.test.ts
│   │   ├── matcher.test.ts
│   │   └── presets.test.ts
│   └── __fixtures__/
├── hooks/
│   ├── __tests__/
│   └── __fixtures__/
└── tools/
    ├── __tests__/
    └── __fixtures__/
```

**Test-Konventionen:**
- **Framework:** [vitest](https://vitest.dev) v3
- **Ort:** `src/**/__tests__/*.test.ts` — eine Test-Datei pro Modul
- **Fixtures:** `src/**/__fixtures__/` — echte YAML/JSON-Dateien, keine Mocks (ausser unvermeidbar)
- **Namenskonvention:** `modul.test.ts` für Unit-Tests, `modul.integration.test.ts` für Integrationstests
- **Coverage-Ziel:** >80% (Statements, Branches, Functions, Lines)
- **Vorgehen:** Test-Driven Development — erst der Test, dann die Implementierung
- **Kein HTTP/IO in Unit-Tests:** ConfigLoader liest echte Fixtures; alle anderen Komponenten testen nur Logik

---

## Community-Richtlinien

- Sei respektvoll und konstruktiv in allen Interaktionen.
- Dieses Projekt folgt dem [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).
- Alle Beiträge unterliegen der [Apache 2.0 License](LICENSE).

---

## Zusätzliche Ressourcen

- [Semantic Anchors Methodik](https://github.com/LLM-Coding/Semantic-Anchors) — das Upstream-Projekt
- [opencode Plugin API Dokumentation](https://opencode.ai/docs/plugins) — Referenz für die Plugin-Entwicklung
- [arc42 Dokumentation](https://docs.arc42.org) — Architektur-Dokumentationsvorlage
- [`docs/concepts/04-language-and-translation.de.md`](docs/concepts/04-language-and-translation.de.md) — detaillierte Übersetzungskonventionen
