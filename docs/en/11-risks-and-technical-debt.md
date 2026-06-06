# 11. Risks and Technical Debt

## 11.1 Overview

This section analyses the risks and technical debt associated with the opencode-semantic-anchors plugin. Risks are assessed by probability and impact; technical debt items are documented with their estimated remediation effort.

## 11.2 Risk Matrix

| ID | Risk | Probability | Impact | Priority | Mitigation |
|----|------|-------------|--------|----------|------------|
| R1 | docToolchain build pipeline breaks (AsciiDoc warnings, jBake header issues, exportMarkdown regressions) | Medium | High | High | Pinned docToolchain version (3.5.0); CI runs the full pipeline on every push; build failure does not block development |
| R2 | English and German documentation versions drift out of sync | Medium | Medium | Medium | Paired review process; TRANSLATION-VERIFICATION checks; docToolchain processes both sets uniformly |
| R3 | opencode Plugin SDK API changes break the plugin | Low | High | High | Function-based API (ADR-010) is the current standard; pin opencode version in CI; regression test suite runs on each opencode release |
| R4 | Dependency on specific opencode versions (tool.execute.before hook behaviour) | Low | Medium | Medium | Fail-open design (ADR-008) ensures graceful degradation; migration path documented for permission.ask (ADR-001) |
| R5 | Test coverage for edge cases in configuration parsing and error handling is incomplete | Medium | Low | Medium | Coverage targets defined (>80%); TDD mandate; gap analysis planned |
| R6 | Documentation becomes outdated as the codebase evolves | Medium | Medium | Medium | Single source of truth pattern (docs/ is authoritative); docToolchain build validates all cross-references |
| R7 | Single maintainer risk (bus factor = 1) | High | Medium | High | CI/CD automates builds; open-source community contributions possible; architecture documented in ADRs for knowledge transfer |

## 11.3 Detailed Risk Analyses

### R1: docToolchain Build Pipeline Stability

The documentation build relies on docToolchain 3.5.0 (Java 17, Gradle) with a multi-step pipeline: `exportMarkdown` -> copy + add jBake headers -> remove `.md` files -> `generateSite` (see ADR-007). Each step is a potential failure point:

- **exportMarkdown** may produce AsciiDoc with warnings for complex Markdown tables or Mermaid diagrams
- **jBake header injection** is a custom shell script -- header format changes in docToolchain updates would break the build
- **Mermaid -> PlantUML conversion** is not automated; contributing upstream to the Semantic-Anchors repository requires manual diagram conversion

**Mitigation:** The CI workflow (`deploy-docs.yml`) is the authoritative reference. Local builds are documented step-by-step in `08-concepts/01-installation.md`. docToolchain version is pinned in `docToolchainConfig.groovy`.

**Related:** ADR-007 (Markdown for Design Docs), `08-concepts/01-installation.md`, `.github/workflows/deploy-docs.yml`

### R2: Bilingual Documentation Synchronisation

Maintaining documentation in both English and German doubles the file count and creates a continuous synchronisation burden (see ADR-012). Common failure modes:

- An English section is updated but the German version is not
- Translation diverges in technical terminology (e.g., "Steering Correctness" handled differently in DE)
- New files are added in English only

**Mitigation:** The `TRANSLATION-VERIFICATION*.md` scripts detect missing or outdated `.md` files. Both languages are built uniformly by docToolchain -- a missing DE file produces a build warning.

**Related:** ADR-012 (Bilingual Documentation), `08-concepts/04-language-and-translation.md`, `TRANSLATION-VERIFICATION.md`

### R3: Plugin SDK API Evolution

The opencode Plugin SDK transitioned from an object-based `AgentPlugin` interface to a function-based `Plugin` type between versions 0.58 and 0.59 (ADR-010). Further changes are expected as opencode approaches 1.0:

- Hook signatures may change again
- The event system replacing dedicated hooks (`chat.message`, `agent.activate`) may still be in flux
- Tool registration may shift from the current object-property pattern

**Mitigation:** The plugin uses the current documented API. A future `permission.ask` migration path is documented in ADR-010 (Future Migration Path). The test suite (81 tests) serves as a regression gate upon SDK updates.

**Related:** ADR-010 (Function-based Plugin API), ADR-001 (tool.execute.before)

### R4: opencode Version Dependency

The plugin's enforcement mechanism relies on the `tool.execute.before` hook because `permission.ask` is unstable in opencode releases as of June 2026 (issues #7006, #28066). This creates a version compatibility risk:

- If opencode removes or changes `tool.execute.before`, enforcement is broken
- If `permission.ask` is stabilised, the plugin has no migration path implemented yet

**Mitigation:** Fail-open design (ADR-008) ensures that hook errors do not crash the session. The migration path is conceptually documented in ADR-010.

**Related:** ADR-001 (tool.execute.before), ADR-008 (Fail-Open), ADR-010 (Future Migration Path)

### R5: Test Coverage Completeness

The test suite (81 tests, 9 test files) covers the core rule engine, configuration loading, and hook integration. However, coverage is not uniform across all modules:

| Module | Estimated Coverage | Risk |
|--------|-------------------|------|
| RuleEngine | >90% | Low |
| ConfigLoader | >85% | Low |
| Hook handlers | >80% | Low |
| Event system integration | <60% | Medium |
| Error injection (fail-open) | >80% | Low |
| Edge cases (malformed YAML, boundary values) | <50% | Medium |

**Mitigation:** Coverage targets are defined (>80% statements, branches, functions, lines) in `10-quality-requirements.md`. TDD is mandated for new features. A dedicated gap analysis is planned for the event-system integration layer.

**Related:** `10-quality-requirements.md` (8.5 Test Strategy)

### R6: Documentation Drift

As the plugin evolves, the arc42 documentation may drift out of sync with the actual implementation. Specific risk areas:

- Building block views become outdated after refactoring
- ADRs accumulate but superseded decisions are not always updated
- Architecture constraints may change without documentation updates
- The docToolchain build validates structure but not semantic correctness of the content

**Mitigation:** The single source of truth pattern (all `.md` files in `docs/`) keeps documentation close to the code. ADRs are immutable after acceptance -- superseding information goes into new ADRs or the relevant section files. CI does not enforce semantic doc-code alignment.

**Related:** ADR-007 (Single Source of Truth Pattern), `08-concepts/02-update-and-maintenance.md`

### R7: Single Maintainer (Bus Factor)

The project is currently maintained by a single person. Key risks:

- Illness or unavailability blocks releases and bug fixes
- Knowledge about the architecture, CI pipeline, and docToolchain configuration is concentrated
- Community contributions require active review capacity

**Mitigation:** Architecture decisions are documented in 13 ADRs. The CI/CD pipeline automates builds, tests, and documentation deployment. The open-source license invites community contributions. Critical processes are documented in `08-concepts/`.

## 11.4 Technical Debt

| ID | Item | Effort | Priority | Description |
|----|------|--------|----------|-------------|
| TD1 | No dedicated event-system test suite | 2-3 days | Medium | Event handling (`message.updated`, `session.created`) is tested only through integration tests. Unit tests for event parsing and routing are missing. |
| TD2 | No automated translation verification in CI | 1-2 days | Medium | TRANSLATION-VERIFICATION scripts exist but are not integrated into CI. Missing DE files are not automatically caught. |
| TD3 | docToolchain pipeline not containerised | 1 day | Low | Local build requires Java 17 + Gradle + docToolchain installation. A Docker image would eliminate environment setup. |
| TD4 | Coverage gap analysis not automated | 2-3 days | Low | Coverage reports exist but are not compared against targets automatically. A CI step to fail on coverage below 80% is not yet implemented. |

## 11.5 Risk Evolution and Review

Risks and technical debt are reviewed as part of the release process. The following triggers initiate a reassessment:

- opencode SDK version bump (major or minor)
- New contributor onboarded (reduces bus factor)
- Test suite growth beyond 150 tests (coverage gap analysis due)
- docToolchain version upgrade
- Stabilisation of `permission.ask` hook in opencode

---

**Source Anchor (source):** arc42 Section 11 -- Risks and Technical Debt. https://arc42.org/sections/11-risks. The arc42 template defines Section 11 for documenting technical risks, their probabilities, impacts, and mitigation strategies.
