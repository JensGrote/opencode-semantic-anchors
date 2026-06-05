# 4. Solution Strategy

## Architecture Overview

The plugin follows a **three-layer architecture**, designed after a systematic review of existing solutions (Take before Buy before Make):

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

**Layer 1 – Configuration:** YAML file in the opencode config directory. Defines Structural Coupling Contracts as a combination of triggers (tool, message, state) and actions (BLOCK, WARN). Contains role-based presets for the 12 Semantic-Anchors roles.

**Layer 2 – Rule Engine:** Core logic. Validates config against schema, matches incoming events against active contracts, evaluates the verdict (ALLOW, BLOCK, WARN). Maintains session state (tool-call-count, override-count, role).

**Layer 3 – Hooks & Tools:** Thin adapters. `tool.execute.before` is the primary enforcement point. `chat.message` provides gentle reminders. `agent.activate` loads role presets. Custom tools enable bypass, status query, and config reload.

> **Source Anchor (source):** opencode Plugin SDK documentation: https://opencode.ai/docs/plugins. See in particular the `Plugin` type (function-based API) with `hooks` and `tool` definitions.

## Key Technical Decisions

### Decision 1: Enforcement via `tool.execute.before` (not `permission.ask`)

| Option | Problem |
|--------|---------|
| `permission.ask` | Unstable in current opencode (Regression Issues #7006, #28066) |
| `tool.execute.before` | Stable, can return allow/block, supports overrideTool |

> **Source Anchor (source):** opencode GitHub Issues #7006 and #28066 concern regressions in the `permission.ask` hook. Status: June 2026. See https://github.com/opencode-ai/opencode/issues/7006 and https://github.com/opencode-ai/opencode/issues/28066. Additionally documented in our `02-architecture-constraints.md`.

### Decision 2: Structural Coupling Contract instead of direct Anchor Enforcement

| Term | Definition | Usage in Plugin |
|------|-----------|-----------------|
| **Semantic Anchor** | Knowledge the LLM already knows from training | Optionally noted as source/reference in the contract (`anchorRefs` field) |
| **Semantic Contract** | Project-local, machine-enforceable rule | This is the actual enforcement unit |

> **Source Anchor (source):** "Terms that don't qualify as semantic anchors can still be useful as Semantic Contracts. A contract defines what a term means in your project — either by composing established anchors or by providing custom definitions that only exist within your team."
> — *rejected-proposals.adoc*, LLM-Coding/Semantic-Anchors Repository. https://github.com/LLM-Coding/Semantic-Anchors/blob/main/docs/rejected-proposals.adoc. Author: Ralf D. Müller (Maintainer). No author line in the file, but the commit history shows contributions by rweisleder and raifdmueller. See also Issue #370 for the evaluation table and Issue #518 (JensGrote) for the rename proposal "Structural Coupling Contract".

### Decision 3: YAML Config (not JSON, not AsciiDoc)

YAML is:
- More readable than JSON for rule definitions
- Diff-friendly (one line change = one line diff)
- Already established for comparable approaches:
  - `agentcontract/spec` uses `.contract.yaml`
  - Kiros `/steering` uses YAML
  - opencode itself uses `opencode.jsonc` (JSON with comments)

> **Take before Buy before Make:** YAML as a format for agent-related contracts is already established in `agentcontract/spec`.
> **Source Anchor (source):** AgentContract Specification. https://github.com/agentcontract/spec/blob/main/SPEC.md. Defines `.contract.yaml` as the standard format for Agent Contracts with pre/postconditions, invariants, and limits. Author: agentcontract/spec Contributors, MIT License. See Section 2 (Contract Format) for the YAML schema.
>
> We adopt the format, not the full schema — because `agentcontract/spec` targets CI gates and framework-agnostic enforcement, while our plugin uses opencode-specific hooks.

### Decision 4: Take before Buy before Make as Plugin Development Principle

Before writing code:

1. **Take** – Does something already exist that we can use directly? (e.g., opencode Plugin SDK)
2. **Buy** – Can we fork/integrate an open-source component? (e.g., `agentcontract/spec` terminology, Semantic-Anchors anchor IDs)
3. **Make** – Custom development only for the opencode-specific part (plugin hooks, YAML config loader)

### Decision 5: Source Anchor as Architecture Principle

Every claim in the design document must be verifiable through a verbatim quoted source. This applies to:
- Definitions (Anchor vs. Contract → rejected-proposals.adoc)
- Technical limitations (permission.ask bug → opencode Issues #7006, #28066)
- Architecture decisions (agentcontract/spec alignment → SPEC.md)

> **Source Anchor (source):** This principle is itself a Semantic Anchor, defined in the LLM-Coding/Semantic-Anchors repository.
> https://github.com/LLM-Coding/Semantic-Anchors/docs/anchors/source-anchor.adoc (assumed path, as anchor files follow the `_template.adoc` naming pattern). See also `_template.adoc` at https://github.com/LLM-Coding/Semantic-Anchors/blob/main/docs/anchors/_template.adoc for the format. The Source Anchor states: "Every claim must be verifiable through a literally quoted, referenced source. The source (URL, title, author) must be provided."

### Decision 6: Markdown for Design Documentation (not AsciiDoc)

The LLM-Coding/Semantic-Anchors repository uses AsciiDoc (`.adoc`) as its standard. For plugin development, we write in Markdown (`.md`) because:

- Lower cognitive load during the design phase
- Better diff readability
- Simpler tool support (no AsciiDoc compiler required)

Conversion to `.adoc` occurs only at contribution time to the Semantic-Anchors repository.

> **Source Anchor (source):** The Semantic-Anchors repository mandates: "AsciiDoc is mandatory — Do not convert to Markdown" (CLAUDE.md, LLM-Coding/Semantic-Anchors, https://github.com/LLM-Coding/Semantic-Anchors/blob/main/CLAUDE.md). This rule applies to content contributed to the repository. For local design documents, it does not apply.

## Quality Goal Realization

| Goal | Realized by |
|------|-------------|
| **Steering Correctness** | BLOCK mode in `tool.execute.before` prevents tool execution on contract violation. No silent ignore. |
| **Output Determinism** | Same config → same contracts → same enforcement results. No variance through prompt interpretation. |
| **Workflow Continuity** | Rule Engine <50ms per check. Bypass mechanism prevents deadlock. Config-based maxOverrides. |
| **Configuration Clarity** | YAML with simple structure: contracts[], triggers[], mode. Role-based presets cover 90% of cases. |
| **Composability** | Plugin uses opencode SDK standard hooks. No global state. Coexists with other plugins. |
