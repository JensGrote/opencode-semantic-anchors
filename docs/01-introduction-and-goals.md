# 1. Introduction and Goals

## Requirements Overview

### The Gap

opencode currently lacks a built-in steering mechanism. While tools like Kiros provide `/steering` files that enforce behavioral rules at runtime, opencode relies solely on prompt instructions — which agents frequently ignore or misinterpret. The [LLM-Coding/Semantic-Anchors](https://github.com/LLM-Coding/Semantic-Anchors) repository defines two distinct concepts to address this:

### Key Distinction: Anchor vs Contract

**Semantic Anchor** (what the LLM already knows):
> *Semantic anchors* are well-defined terms, methodologies, and frameworks that serve as reference points when communicating with Large Language Models (LLMs). They act as shared vocabulary that triggers specific, contextually rich knowledge domains within an LLM's training data.
>
> — *docs/about.adoc, LLM-Coding/Semantic-Anchors*

**Semantic Contract** (what must be enforced project-specifically):
> Terms that don't qualify as semantic anchors can still be useful as Semantic Contracts. A contract defines what a term means in your project — either by composing established anchors or by providing custom definitions that only exist within your team.
>
> — *docs/rejected-proposals.adoc, LLM-Coding/Semantic-Anchors*

The evaluation distinguishes accordingly:

| | Anchor Eval | Contract Eval |
|---|---|---|
| Tests | Recognition / knowledge | Compliance / behavior |
| Prompt | Direct question | Task with system context |
| Scoring | Does it know the term? | Does it follow the instruction? |
| System prompt | None | Contains the contract |

> — *Issue #370, LLM-Coding/Semantic-Anchors*

### Design Principles for this Plugin

**Source Anchor (cite verbatim, do not paraphrase):** Every claim in the design must be verifiable through a verbatim quoted source. No speculation about error causes or concepts without a source citation.

**Take before Buy before Make:** Before writing any code, check whether an existing solution exists — including forks and open-source components. "Buy" includes integrating existing open-source components.

### Solution

The `opencode-semantic-anchors` plugin closes the steering gap. It provides a **runtime steering mechanism** for opencode that:

- Intercepts tool calls and chat messages via plugin hooks
- Evaluates agent behavior against configured **Structural Coupling Contracts** — rules that define trigger conditions (tool calls, messages, state) and enforcement actions (BLOCK/WARN)
- Contracts can optionally reference [Semantic Anchors](https://github.com/LLM-Coding/Semantic-Anchors) as their knowledge source, but can also be standalone steering rules (e.g., "always respond in German", "use MECE structure", "follow BLUF format")
- **Blocks** or **warns** before violations occur — rather than relying on agent self-discipline

The result is more deterministic agent behavior, higher quality code, and clear, enforceable guidelines that reduce variance between sessions.

## Quality Goals

| Priority | Goal | Description |
|----------|------|-------------|
| 1 | **Steering Correctness** | Every configured steering rule must be enforced (BLOCK mode) when its trigger condition is met. No silent ignore. |
| 2 | **Reliability** | LLM responses must become more predictable, reproducible, and traceable. Same steering configuration must produce the same agent behavior across sessions (**Determinism**). Session replay with identical input must produce identical output (**Reproducibility**). Block/warn decisions must be explainable from logs (**Traceability**). Agent behavior must be consistent, not surprising (**Predictability**). Reduce variance from prompt-only guidance. |
| 3 | **Workflow Continuity** | Hook checks complete in <50ms. Steering must not block the agent UX unnecessarily. Bypass mechanism prevents deadlock. |
| 4 | **Configuration Clarity** | Steering rules are defined in simple YAML. Role-based presets cover 90% of use cases. |
| 5 | **Composability** | Coexists with other opencode plugins and existing prompt instructions. No shared mutable state. |
| 6 | **Context Efficiency** | Steering rules must NOT consume LLM context tokens. All enforcement must happen via plugin hooks, not via system prompt instructions. The plugin must not contribute to "instruction gluttony" or compete with task context. |

## Stakeholders

| Role | Concern |
|------|---------|
| Software Developer / Engineer | Directly benefits from enforcement of Intent, Source, Verification, Step Confirmation anchors during coding sessions |
| Consultant / Coach | Wants to use the plugin to teach teams the anchor methodology without manual oversight |
| Software Architect | Needs architecture-level anchors (Boundary, Emergence) enforced in design sessions |
| Team Lead / Engineering Manager | Wants team-wide consistency and measurable anchor compliance |
| **Compliance / Governance Officer** | Needs enforceable rules (not "soft suggestions") and an audit log of violations and bypasses |
| **Ethics Reviewer** | Needs Ethical Anchor enforcement — plugin must make ethical implications verifiable |
| **Data Privacy Officer** | Needs assurance that no secrets or personal data leak through tool calls or logs |
| **C-Level / Decision Maker** | Needs metrics: "Is the method being followed?" — without having to use the tool themselves |
| **Works Council (Betriebsrat)** | Must consent before deployment. Plugin must not be used for performance monitoring or discipline. Bypass logs must be GDPR-compliant. |

> **Note:** The Compliance, Ethics, Data Privacy, C-Level, and Works Council stakeholders sit *outside the direct developer chain*. They are not in the reporting line and do not configure the plugin themselves. They require:
> - **Audit logs** aggregated across sessions (not just CLI output)
> - **Policy review** before deployment (Works Council consent)
> - **Dashboards or reports** — not CLI tools
> - **Anonymized metrics** to avoid singling out individuals (DSGVO/GDPR requirement)
