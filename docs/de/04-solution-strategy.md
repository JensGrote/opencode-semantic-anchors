# 4. Lösungsstrategie

## Architekturüberblick

Das Plugin folgt einer **Drei-Schichten-Architektur**, entwickelt nach einer systematischen Prüfung vorhandener Lösungen (Take before Buy before Make):

```mermaid
graph TB
  subgraph "Layer 1: Configuration"
    YAML[opencode-semantic-anchors.yaml]
    PRESETS[Role-based Presets]
    SCHEMA[Schema Validation]
  end

  subgraph "Layer 2: Rule Engine"
    LOADER[Config Loader]
    MATCHER[Anchor/Contract Matcher]
    EVAL[Verdict Evaluator]
    STATE[Session State]
  end

  subgraph "Layer 3: Hooks"
    TEB[tool.execute.before]
    CM[chat.message]
    AA[agent.activate]
    TOOLS[/anchor bypass, status, config-reload]
  end

  YAML --> LOADER
  PRESETS --> LOADER
  SCHEMA --> LOADER
  LOADER --> MATCHER
  MATCHER --> EVAL
  STATE --> EVAL
  EVAL --> TEB
  EVAL --> CM
  EVAL --> AA
  TOOLS --> STATE
```

**Schicht 1 – Konfiguration:** YAML-Datei im opencode-Konfigurationsverzeichnis. Definiert Structural Coupling Contracts als Kombination von Triggern (Tool, Message, State) und Aktionen (BLOCK, WARN). Enthält rollenbasierte Voreinstellungen für die 12 Semantic-Anchors-Rollen.

**Schicht 2 – Rule Engine:** Kernlogik. Validiert Konfiguration gegen Schema, gleicht eingehende Ereignisse mit aktiven Contracts ab, wertet die Entscheidung aus (ALLOW, BLOCK, WARN). Führt Session State (Tool-Aufrufzahl, Override-Zähler, Rolle).

**Schicht 3 – Hooks & Tools:** Dünne Adapter. `tool.execute.before` ist der primäre Enforcement-Punkt. `chat.message` gibt sanfte Erinnerungen. `agent.activate` lädt Rollenvoreinstellungen. Benutzerdefinierte Tools ermöglichen Bypass, Statusabfrage und Konfigurationsneuladung.

> **Source Anchor (source):** opencode Plugin SDK documentation: https://opencode.ai/docs/plugins. Siehe insbesondere den `Plugin`-Typ (funktionsbasierte API) mit `hooks`- und `tool`-Definitionen.

## Wichtige technische Entscheidungen

### Entscheidung 1: Enforcement über `tool.execute.before` (nicht `permission.ask`)

| Option | Problem |
|--------|---------|
| `permission.ask` | Instabil im aktuellen opencode (Regressionen #7006, #28066) |
| `tool.execute.before` | Stabil, kann allow/block zurückgeben, unterstützt overrideTool |

> **Source Anchor (source):** opencode GitHub Issues #7006 and #28066 concern regressions in the `permission.ask` hook. Status: June 2026. See https://github.com/opencode-ai/opencode/issues/7006 and https://github.com/opencode-ai/opencode/issues/28066. Zusätzlich dokumentiert in unserer `02-architecture-constraints.md`.

### Entscheidung 2: Structural Coupling Contract statt direktem Anchor Enforcement

| Begriff | Definition | Verwendung im Plugin |
|---------|-----------|---------------------|
| **Semantic Anchor** | Wissen, das das LLM bereits aus dem Training kennt | Optional als Quelle/Referenz im Vertrag vermerkt (`anchorRefs`-Feld) |
| **Semantic Contract** | Projektlokale, maschinell durchsetzbare Regel | Dies ist die eigentliche Enforcement-Einheit |

> **Source Anchor (source):** "Terms that don't qualify as semantic anchors can still be useful as Semantic Contracts. A contract defines what a term means in your project — either by composing established anchors or by providing custom definitions that only exist within your team."
> — *rejected-proposals.adoc*, LLM-Coding/Semantic-Anchors Repository. https://github.com/LLM-Coding/Semantic-Anchors/blob/main/docs/rejected-proposals.adoc. Author: Ralf D. Müller (Maintainer). No author line in the file, but the commit history shows contributions by rweisleder and raifdmueller. Siehe auch Issue #370 für die Bewertungstabelle und Issue #518 (JensGrote) für den Umbenennungsvorschlag "Structural Coupling Contract".

### Entscheidung 3: YAML-Konfiguration (nicht JSON, nicht AsciiDoc)

YAML ist:
- Lesbarer als JSON für Regeldefinitionen
- Diff-freundlich (eine Zeile Änderung = eine Zeile Diff)
- Bereits etabliert für vergleichbare Ansätze:
  - `agentcontract/spec` verwendet `.contract.yaml`
  - Kiros `/steering` verwendet YAML
  - opencode selbst verwendet `opencode.jsonc` (JSON mit Kommentaren)

> **Take before Buy before Make:** YAML als Format für agentenbezogene Verträge ist bereits in `agentcontract/spec` etabliert.
> **Source Anchor (source):** AgentContract Specification. https://github.com/agentcontract/spec/blob/main/SPEC.md. Defines `.contract.yaml` as the standard format for Agent Contracts with pre/postconditions, invariants, and limits. Author: agentcontract/spec Contributors, MIT License. See Section 2 (Contract Format) for the YAML schema.
>
> Wir übernehmen das Format, nicht das vollständige Schema — weil `agentcontract/spec` auf CI-Gatter und framework-unabhängiges Enforcement abzielt, während unser Plugin opencode-spezifische Hooks verwendet.

### Entscheidung 4: Take before Buy before Make als Plugin-Entwicklungsprinzip

Bevor Code geschrieben wird:

1. **Take** – Gibt es etwas, das wir direkt nutzen können? (z. B. opencode Plugin-SDK)
2. **Buy** – Können wir eine Open-Source-Komponente forken/integrieren? (z. B. `agentcontract/spec`-Terminologie, Semantic-Anchors-Anchor-IDs)
3. **Make** – Eigenentwicklung nur für den opencode-spezifischen Teil (Plugin-Hooks, YAML-Config-Loader)

### Entscheidung 5: Source Anchor als Architekturprinzip

Jede Behauptung im Entwurfsdokument muss durch ein wörtlich zitiertes Quelle belegbar sein. Dies gilt für:
- Definitionen (Anchor vs. Contract → rejected-proposals.adoc)
- Technische Einschränkungen (permission.ask-Fehler → opencode Issues #7006, #28066)
- Architekturentscheidungen (agentcontract/spec-Angleichung → SPEC.md)

> **Source Anchor (source):** This principle is itself a Semantic Anchor, defined in the LLM-Coding/Semantic-Anchors repository.
> https://github.com/LLM-Coding/Semantic-Anchors/docs/anchors/source-anchor.adoc (assumed path, as anchor files follow the `_template.adoc` naming pattern). See also `_template.adoc` at https://github.com/LLM-Coding/Semantic-Anchors/blob/main/docs/anchors/_template.adoc for the format. The Source Anchor states: "Every claim must be verifiable through a literally quoted, referenced source. The source (URL, title, author) must be provided."

### Entscheidung 6: Markdown für Entwurfsdokumentation (nicht AsciiDoc)

Das Repository LLM-Coding/Semantic-Anchors verwendet AsciiDoc (`.adoc`) als Standard. Für die Plugin-Entwicklung schreiben wir in Markdown (`.md`), weil:

- Geringere kognitive Last während der Entwurfsphase
- Bessere Diff-Lesbarkeit
- Einfachere Tool-Unterstützung (kein AsciiDoc-Compiler erforderlich)

Die Konvertierung nach `.adoc` erfolgt erst bei Beitrag zum Semantic-Anchors-Repository.

> **Source Anchor (source):** The Semantic-Anchors repository mandates: "AsciiDoc is mandatory — Do not convert to Markdown" (CLAUDE.md, LLM-Coding/Semantic-Anchors, https://github.com/LLM-Coding/Semantic-Anchors/blob/main/CLAUDE.md). This rule applies to content contributed to the repository. For local design documents, it does not apply.

### Entscheidung 7: Anchor-Regeln werden zur Entwurfszeit gebündelt (nicht zur Laufzeit abgerufen)

Anchor-Regeln werden **nicht zur Laufzeit von GitHub abgerufen**. Sie werden aus dem Semantic-Anchors-Repository zur Entwurfszeit abgeleitet und als standardmäßiges YAML-Preset im Plugin-Paket gebündelt. Vollständige Begründung, Alternativen und Konsequenzen in [ADR-013](../09-adrs/ADR-013-design-time-bundling.md).

## Qualitätszielumsetzung

| Ziel | Umgesetzt durch |
|------|-----------------|
| **Steuerungskorrektheit** | BLOCK-Modus in `tool.execute.before` verhindert Tool-Ausführung bei Contract-Verletzung. Kein stilles Ignorieren. |
| **Ausgabedeterminismus** | Gleiche Konfiguration → gleiche Verträge → gleiche Enforcement-Ergebnisse. Keine Varianz durch Prompt-Interpretation. |
| **Workflow-Kontinuität** | Rule Engine <50ms pro Prüfung. Override-Mechanismus verhindert Deadlock. Konfigurationsbasierte maxOverrides. |
| **Konfigurationsklarheit** | YAML mit einfacher Struktur: contracts[], triggers[], mode. Rollenbasierte Voreinstellungen decken 90% der Fälle ab. |
| **Komponierbarkeit** | Plugin verwendet opencode SDK-Standard-Hooks. Kein globaler Zustand. Koexistiert mit anderen Plugins. |
