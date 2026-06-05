# 9. Glossary

## Domain Terms

| Term | Definition | Source / Reference |
|------|-----------|-------------------|
| **Semantic Anchor** | Well-defined terms, methodologies, and frameworks that serve as reference points when communicating with LLMs. They trigger specific, contextually rich knowledge domains within an LLM's training data. | `docs/about.adoc`, LLM-Coding/Semantic-Anchors |
| **Semantic Contract** | A project-specific definition of what a term means — either by composing established anchors or by providing custom definitions that only exist within a team. Unlike anchors, contracts must be enforced at runtime. | `docs/rejected-proposals.adoc`, LLM-Coding/Semantic-Anchors |
| **Anchor Eval** | Evaluation that tests whether an LLM *recognises* a semantic anchor (knowledge test, direct question). | Issue #370, LLM-Coding/Semantic-Anchors |
| **Contract Eval** | Evaluation that tests whether an LLM *complies* with a contract (behavioral test, task with system context). | Issue #370, LLM-Coding/Semantic-Anchors |
| **Structural Coupling Contract** | The plugin's internal runtime representation of a steering rule. Consists of contract ID, optional anchor reference, trigger pattern, action (allow/block/warn), and mode (enforce/log). | `docs/04-solution-strategy.md` |
| **Intent Anchor** | First of the four semantic anchors. Formulates what should happen in a testable/verifiable way. | LLM-Coding/Semantic-Anchors |
| **Negative Anchor** | Second semantic anchor. Explicitly states what must NOT happen (prohibitions). | LLM-Coding/Semantic-Anchors |
| **Verification Anchor** | Third semantic anchor. Defines how to verify the result (reverse reconstruction: compare outcome with intent). | LLM-Coding/Semantic-Anchors |
| **Source Anchor** | Fourth semantic anchor. Every claim must be verifiable through a literally quoted, referenced source. | LLM-Coding/Semantic-Anchors |
| **Steering Rule** | A configured behavioral directive that the plugin enforces at runtime (e.g. "step confirmation after 3 tool calls"). Synonymous with Structural Coupling Contract. | `docs/04-solution-strategy.md` |
| **Trigger Pattern** | The condition that activates a steering rule (e.g. `tool.execute.before` with call counter > N). Part of a Structural Coupling Contract. | `docs/05-building-block-view.md` |
| **Action** | What the plugin does when a trigger fires: `allow` (let pass), `block` (throw Error), `warn` (log warning). | `docs/05-building-block-view.md` |
| **Mode** | Operational mode of a contract: `enforce` (actively block/warn) or `log` (evaluate but never block — used for testing). | `docs/05-building-block-view.md` |

## Acronyms and Abbreviations

| Abbreviation | Full Form | Definition |
|-------------|-----------|------------|
| **ADR** | Architecture Decision Record | A document capturing an architectural decision, its context, alternatives, and consequences (Nygard format). |
| **arc42** | arc42 Template | Template for documenting software and system architectures. 12 sections covering goals, constraints, building blocks, runtime, deployment, etc. |
| **ATAM** | Architecture Tradeoff Analysis Method | Method for evaluating software architectures against quality attribute scenarios. |
| **BLUF** | Bottom Line Up Front | Communication principle: start with the conclusion, then provide details. |
| **C4 Model** | Context, Containers, Components, Code | Hierarchical model for visualising software architecture. |
| **ISO 25010** | ISO/IEC 25010 | Systems and software Quality Requirements and Evaluation (SQuaRE) — quality model with 8 categories. |
| **MECE** | Mutually Exclusive, Collectively Exhaustive | Structuring principle: categories must not overlap and must cover all possibilities. |
| **NFR** | Non-Functional Requirement | Quality attribute or constraint that specifies how a system should behave (performance, security, reliability, etc.). |
| **PII** | Personally Identifiable Information | Data that can identify a person (names, addresses, credentials). |
| **Plugin API** | opencode Plugin API | Function-based API for extending opencode with hooks and tools. Current API: `Plugin` function returning `{ hooks, tool }`. |
| **Zod** | Zod | TypeScript-first schema declaration and validation library. Used for YAML config validation. |

## Project-Specific Terms

| Term | Definition |
|------|-----------|
| **Bypass** | Mechanism that temporarily overrides all active Block-Contracts for the current session. Activated via `/anchor bypass` tool. |
| **Config Layer** | The layer responsible for loading, parsing, and validating the YAML configuration file. |
| **RuleEngine** | Core module that evaluates trigger conditions against tool-call context and returns a verdict (allow/block/warn). |
| **Hook Handler** | The `tool.execute.before` hook that intercepts tool calls and delegates evaluation to the RuleEngine. |
| **Fail-Open** | Error-handling principle: when the plugin encounters an internal error, it allows the tool call to proceed (no block). Prevents plugin failures from blocking user work. |
| **Context Efficiency** | Design principle that steering rules must not consume LLM context tokens. All enforcement happens via plugin hooks, not the system prompt. |
| **Step Confirmation** | A contract that requires explicit user confirmation after a configurable number of tool calls (e.g. "warn after 5, block after 10"). |
| **Role-based Preset** | A pre-configured set of contracts tailored to a persona (e.g. `developer`, `admin`, `reviewer`). Covers 90% of use cases out of the box. |
| **Reliability** | Quality goal encompassing determinism (same input → same verdict), reproducibility (session replay produces identical output), traceability (every decision is logged with contract ID and rule state), and predictability (consistent agent behavior). |

## Architecture Terms

| Term | Definition |
|------|-----------|
| **3-Layer Architecture** | Plugin structure: Config Layer (load/validate) → RuleEngine (evaluate) → Hook Handler (intercept). |
| **Proxy Module** | Internal module that adapts the RuleEngine output to the opencode Plugin API conventions (throw for block, log for warn). |
| **Custom Tool** | A tool exposed to the LLM by the plugin (e.g. `/anchor bypass`, `/anchor status`). |
| **Anchor Ref** | Optional reference from a Structural Coupling Contract back to a Semantic Anchor definition. Enables traceability from enforcement to methodology. |
| **Nygard Format** | ADR format by Michael Nygard: Context, Decision, Consequences. Used for all architecture decisions in this project. |
