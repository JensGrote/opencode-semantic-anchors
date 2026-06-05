# Contributing to opencode-semantic-anchors

Thank you for considering a contribution. This document describes how the project is structured, how development is organised, and how to contribute effectively in **English** or **German**.

> **🇩🇪 Deutsche Version:** [`CONTRIBUTING.de.md`](CONTRIBUTING.de.md)

---

## Project overview

`opencode-semantic-anchors` is an [opencode](https://opencode.ai) plugin that provides **runtime steering** for LLM agents. It enforces behavioural rules (anchors, contracts, step confirmations) via plugin hooks — without consuming LLM context tokens.

The plugin is designed as a **contribution to the [LLM-Coding/Semantic-Anchors](https://github.com/LLM-Coding/Semantic-Anchors)** repository (see [ADR-005](docs/decisions/ADR-005-repository-strategy.md) for the standalone-repo strategy with cross-links).

### Design approach

The architecture is documented using the [arc42](https://arc42.org) template. All documents are available bilingually:

| Section | English | Deutsch |
|---------|---------|---------|
| Introduction & Goals | [`01-introduction-and-goals.md`](docs/01-introduction-and-goals.md) | [`01-introduction-and-goals.de.md`](docs/01-introduction-and-goals.de.md) |
| Architecture Constraints | [`02-architecture-constraints.md`](docs/02-architecture-constraints.md) | [`02-architecture-constraints.de.md`](docs/02-architecture-constraints.de.md) |
| System Scope & Context | [`03-system-scope-and-context.md`](docs/03-system-scope-and-context.md) | [`03-system-scope-and-context.de.md`](docs/03-system-scope-and-context.de.md) |
| Solution Strategy | [`04-solution-strategy.md`](docs/04-solution-strategy.md) | [`04-solution-strategy.de.md`](docs/04-solution-strategy.de.md) |
| Building Block View | [`05-building-block-view.md`](docs/05-building-block-view.md) | [`05-building-block-view.de.md`](docs/05-building-block-view.de.md) |
| Runtime View | [`06-runtime-view.md`](docs/06-runtime-view.md) | [`06-runtime-view.de.md`](docs/06-runtime-view.de.md) |
| Deployment View | [`07-deployment-view.md`](docs/07-deployment-view.md) | [`07-deployment-view.de.md`](docs/07-deployment-view.de.md) |
| Quality Requirements | [`08-quality-requirements.md`](docs/08-quality-requirements.md) | [`08-quality-requirements.de.md`](docs/08-quality-requirements.de.md) |
| Glossary | [`09-glossary.md`](docs/09-glossary.md) | [`09-glossary.de.md`](docs/09-glossary.de.md) |

Architecture decisions are recorded as **ADRs (Architecture Decision Records)** in [`docs/decisions/`](docs/decisions/). Crosscutting concepts in [`docs/concepts/`](docs/concepts/).

---

## Development phases

The project is developed in **5 phases**, tracked as GitHub Milestones:

| Milestone | Goal |
|-----------|------|
| **Phase 1: Design** | Complete arc42 architecture documentation and ADRs. All design decisions reviewed and approved. |
| **Phase 2: Prototype** | Implement the core plugin: RuleEngine, `tool.execute.before` hook, YAML config loader, `/anchor bypass` and `/anchor status` tools. |
| **Phase 3: Extension** | Add Source Anchor enforcement, Role-based Presets, Config Reload tool. |
| **Phase 4: Tests & Docs** | Unit tests (vitest), integration tests, README, npm package build. |
| **Phase 5: Contribution** | PR to LLM-Coding/Semantic-Anchors, npm publish. |

---

## Issues: naming conventions and labels

Issues may be filed in **English or German**. Both languages are equally welcome.

### Issue title convention

Titles follow the pattern **`[Category]: Specific description`** — consistent with the upstream Semantic-Anchors repository conventions:

| Category | When to use | Example |
|----------|-------------|---------|
| `[Design]` | arc42 section feedback, architecture decisions | `[Design]: Add Context Efficiency to quality goals` |
| `[Feature]` | New feature or capability request | `[Feature]: Role-based presets for developer/admin/reviewer` |
| `[Bug]` | Defect or unexpected behaviour | `[Bug]: Config loader crashes on empty YAML file` |
| `[Docs]` | Documentation improvements, translations | `[Docs]: German translation of 05-building-block-view.md` |
| `[Proposal]` | Open-ended proposal for discussion | `[Proposal]: Support for custom trigger patterns` |
| `[Question]` | Clarification or how-to | `[Question]: How do contracts interact with multiple plugins?` |

**Examples from the upstream repo** (LLM-Coding/Semantic-Anchors):

```
[Role Taxonomy Proposal]: Cross-Cutting Governance Roles
[Category Proposal]: AI Ethics & Governance
[Framework Proposal]: Structural Coupling Contract + System-Theoretic Semantic Anchors
[Metadata Proposal]: Systemic & Human dimensions as optional anchor metadata
```

### Issue labels

| Label | Colour | Description |
|-------|--------|-------------|
| `design` | 🔵 blue | Design decisions, arc42 documentation |
| `enhancement` | 🟢 green | Feature requests |
| `bug` | 🔴 red | Defects |
| `docs` | ⚪ grey | Documentation |
| `question` | 🟣 purple | Clarification needed |
| `phase-1` | `—` | Design phase |
| `phase-2` | `—` | Prototype phase |
| `phase-3` | `—` | Extension phase |
| `phase-4` | `—` | Tests & docs phase |
| `phase-5` | `—` | Contribution phase |
| `good-first-issue` | 🟡 yellow | Suitable for new contributors |

### Source Anchor in issues

Every issue describing a problem or proposing a solution must apply the [Source Anchor](https://github.com/LLM-Coding/Semantic-Anchors) principle: each claim must cite a verbatim, referenced source. This applies regardless of language.

---

## Pull Requests

### Workflow

1. Fork the repository and create a feature branch from `main`:
   ```
   git checkout -b <category>/<description>
   ```
2. Make your changes. See [Language conventions](#language-conventions) for bilingual documentation.
3. Ensure tests pass (see [Building and testing](#building-and-testing)).
4. Open a Pull Request against `main`.
5. All PRs require at least one review before merging.

### Branch naming

| Pattern | Purpose |
|---------|---------|
| `feat/*` | New feature |
| `fix/*` | Bug fix |
| `docs/*` | Documentation-only changes (EN) |
| `docs-de/*` | German documentation changes |
| `refactor/*` | Code refactoring without functional change |
| `test/*` | Test-only changes |

### Commit messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.

**For bilingual documentation changes**, use `docs` type with the section as scope:

```
docs(05-building-block-view): add German translation
```

### Code review checklist

Every PR is reviewed against:

- **Functional correctness** — does the code do what it claims?
- **Design compliance** — does it follow the arc42 architecture?
- **Source Anchor compliance** — are claims verifiable?
- **Bilingual documentation** — are both EN and DE versions updated? (see [Language conventions](#language-conventions))
- **Test coverage** — is there a test for the change?

---

## Language conventions

Documentation is **bilingual (English + German)**, following the upstream Semantic-Anchors convention:

| Language | File suffix | Example |
|----------|-------------|---------|
| English (primary) | `.md` | `01-introduction-and-goals.md` |
| German (parallel) | `.de.md` | `01-introduction-and-goals.de.md` |
| English (after contribution) | `.adoc` | `01-introduction-and-goals.adoc` |
| German (after contribution) | `.de.adoc` | `01-introduction-and-goals.de.adoc` |

### Translation principle (literal with intent-resolve)

1. **Literal** — translate as closely as possible, no paraphrasing.
2. **If ambiguous** — choose the translation that best reflects the *intent* and *domain correctness* over literal word choice.
3. **Technical terms remain untranslated** — `RuleEngine`, `tool.execute.before`, `Fail-Open`, `Bypass`, `Steering Contract`, `Hook`.
4. **Accountability** — every translation must be verifiable via git diff. No silent content changes.
5. **Issues and PRs** may be written in English or German — no translation required for discussion.

See [ADR-012](docs/decisions/ADR-012-bilingual-documentation.md) and [`docs/concepts/04-language-and-translation.md`](docs/concepts/04-language-and-translation.md) for details.

---

## Building and testing

```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint
npm run lint
```

### Test structure

```
src/
├── __tests__/
│   ├── fixtures/
│   │   └── test-config.yaml        # YAML fixture for integration tests
│   └── integration.test.ts         # Full pipeline integration test (14 tests)
├── config/
│   ├── __tests__/
│   │   └── loader.test.ts          # 6 unit tests
├── rules/
│   ├── __tests__/
│   │   ├── engine.test.ts          # 18 unit tests (BLOCK, WARN, step-conf, override, messages)
│   │   └── matcher.test.ts         # 13 unit tests
├── hooks/
│   ├── __tests__/
│   │   ├── toolExecute.test.ts     # 4 unit tests
│   │   └── chatMessage.test.ts     # 4 unit tests
└── tools/
    ├── __tests__/
    │   ├── bypass.test.ts          # 1 unit test
    │   ├── status.test.ts          # 1 unit test
    │   └── configReload.test.ts    # 1 unit test
```

**Test conventions:**
- **Framework:** [vitest](https://vitest.dev) v3
- **Location:** `src/**/__tests__/*.test.ts` — one test file per module
- **Fixtures:** `src/__tests__/fixtures/` — real YAML/JSON files for integration tests
- **Naming:** `*.test.ts` for unit tests, `integration.test.ts` for the full pipeline
- **Coverage target:** >80% (statements, branches, functions, lines)
- **Approach:** Test-Driven Development — write the test first, then implement
- **No HTTP/IO in unit tests:** ConfigLoader reads real files; all other components test logic only

---

## Community guidelines

- Be respectful and constructive in all interactions.
- This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).
- All contributions are subject to the [Apache 2.0 License](LICENSE).

---

## Additional resources

- [Semantic Anchors methodology](https://github.com/LLM-Coding/Semantic-Anchors) — the upstream project
- [opencode Plugin API docs](https://opencode.ai/docs/plugins) — reference for plugin development
- [arc42 documentation](https://docs.arc42.org) — architecture documentation template
- [`docs/concepts/04-language-and-translation.md`](docs/concepts/04-language-and-translation.md) — detailed translation conventions
