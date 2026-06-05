# Language and Translation Conventions

## Status: Topic Note (not fully elaborated)

## 1. Scope

This document defines the language and translation conventions for the entire design documentation of the opencode-semantic-anchors plugin. It applies to all arc42 sections, crosscutting concepts, and Architecture Decision Records.

## 2. Language Strategy

The project is maintained **bilingually (English + German)**, in accordance with the convention of the LLM-Coding/Semantic-Anchors upstream repository.

> **Source Anchor:** https://github.com/LLM-Coding/Semantic-Anchors/tree/main/docs — 7 of 14 documentation files have a `.de.adoc` parallel version.

### File Convention

| Language | Suffix | Example |
|----------|--------|---------|
| English (primary) | `.md` | `01-introduction-and-goals.md` |
| German (parallel) | `.de.md` | `01-introduction-and-goals.de.md` |
| English (after contribution) | `.adoc` | `01-introduction-and-goals.adoc` |
| German (after contribution) | `.de.adoc` | `01-introduction-and-goals.de.adoc` |

### Translation Principle: Literal Translation with Intent-Resolve

**Translation hierarchy (descending binding):**

#### Level 1: Literal
Each sentence is translated as closely as possible to the original. No semantic paraphrasing, no "embellishment", no omissions.

**Correct:** "The plugin intercepts the tool.execute.before hook."
→ "Das Plugin interceptet den tool.execute.before Hook."

**Incorrect:** "The plugin intercepts the tool.execute.before hook."
→ "Das Plugin greift in den Ausführungsprozess ein." (semantic paraphrase)

#### Level 2: Intent-Resolve on Ambiguity
If a term or sentence is not unambiguously translatable (e.g., "steering" → "Lenkung" vs. "Steuerung" vs. "Führung"), the decision follows this priority:

1. **Domain Correctness** — Which translation most precisely represents the technical term in the context of the system architecture?
2. **Intent Anchor** — What is supposed to happen per definition? The translation must convey the purpose of the concept.
3. **Established Terminology** — Is there an established German technical term? (e.g., "Bausteinsicht" for "Building Block View" in arc42)

**Example: "Steering Correctness"**
- Literal: "Lenkungsrichtigkeit" (rare, uncommon)
- Intent: "The plugin correctly blocks on rule violations"
- **Decision: "Steuerungskorrektheit"** (closer to the intent of runtime enforcement)

**Example: "Workflow Continuity"**
- Literal: "Arbeitsablaufkontinuität" (unreadable)
- Intent: "The plugin must not interrupt the workflow"
- **Decision: "Workflow-Kontinuität"** (technical term remains English, intent clear)

#### Level 3: Technical Terms Remain Untranslated
The following terms are **not translated** in the German version, but adopted as loanwords:

| Term | Rationale |
|------|-----------|
| `RuleEngine` | Component proper name |
| `tool.execute.before` | opencode API hook name |
| `Hook` | opencode technical term |
| `Steering Contract` / `Structural Coupling Contract` | Defined technical term in the design |
| `Fail-Open` | Established English architectural term |
| `Bypass` | Product feature name |
| `Config Layer` | Component name |
| `Anchor` / `Semantic Anchor` | Name of the methodology |
| `arc42` | Template proper name |
| `ADR` | Standard abbreviation |

## 3. Quality Assurance

### Translation Must Be Traceable
Every translation must be verifiable in the git diff. A German version never silently changes the content of the English version. If a translation *must* deviate from the English (e.g., because a concept is structured differently in German), the deviation is marked with a comment:

```markdown
> **Translation Note:** The German translation restructures this paragraph
> because the original English list contains items that are interdependent.
> Intent and domain correctness preserved.
```

### Regular Synchronisation
Both language versions must be updated synchronously on every content change. `MASTER-TODO.md` notes when one language version lags behind.

## 4. Responsibilities

| Role | Responsibility |
|------|---------------|
| Author (EN) | Writes the English primary version |
| Translator (DE) | Creates the German parallel version according to this convention |
| Reviewer | Verifies domain correctness of both language versions |

In practice (single-developer mode): Both roles are combined. The convention serves as self-control.

## 5. Relationship to Other Conventions

- **ADR-007** (Markdown Format): Language and format are separate concerns. The language convention applies regardless of file format (.md or .adoc).
- **ADR-012** (Bilingual Documentation): Contains the decision rationale for bilingualism.
- **02-architecture-constraints.md**: Contains the Language Constraint as a hard constraint.

## 6. Exceptions

Deviations from bilingualism are permitted in the following cases:

- **Temporary notes and working documents** (e.g., session files in `SESSIONS/`) — only in the working language
- **Architecture Decision Records (ADRs)** — primarily in German (as before), since ADR discussions take place in a German team context. An English summary may be added.
- **Code comments and inline documentation** — in English (code standard)
