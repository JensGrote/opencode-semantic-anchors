# Crosscutting Concept: Update & Maintenance

## 1. Versioning Strategy

The plugin follows **Semantic Versioning** (SemVer 2.0.0):

| Component | Example | Meaning |
|-----------|---------|---------|
| **MAJOR** | `2.0.0` | Breaking changes (hook API, config schema, removed features) |
| **MINOR** | `1.3.0` | New features (new hooks, new roles, new tools) |
| **PATCH** | `1.2.5` | Bug fixes, security patches, dependency updates |

> **Source Anchor (Quelle):** Semantic Versioning 2.0.0. https://semver.org/. "MAJOR version when you make incompatible API changes, MINOR version when you add functionality in a backward-compatible manner, PATCH version when you make backward-compatible bug fixes."

### Pre-release tags

- `1.0.0-alpha.1` — internal testing
- `1.0.0-beta.1` — community testing
- `1.0.0-rc.1` — release candidate

## 2. Release Process

```
1. Create release branch: release/vX.Y.Z
2. Update CHANGELOG.md
3. Bump version in package.json
4. Run full test suite (vitest)
5. Create GitHub Release with tag vX.Y.Z
6. Merge release branch → main
7. Publish to npm (v2 feature)
8. Update documentation
```

**Changelog format:** Keep a Changelog (https://keepachangelog.com/en/1.1.0/)

```markdown
# Changelog

## [1.1.0] - 2026-07-15

### Added
- New hook: `agent.activate` for role-based preset loading
- `/anchor config-reload` tool (requires `edit` permission)

### Fixed
- RuleEngine `evaluate()` now correctly resets toolCallCount on role change

### Security
- Updated zod to 3.23.8 (fixes CVE-2026-1234)
```

## 3. Library Update Strategy

### Dependency Management

The plugin has minimal runtime dependencies (see `01-installation.md`). Updates are managed through:

| Tool | Purpose | Status |
|------|---------|--------|
| `npm audit` | Manual vulnerability scan | Pre-commit |
| `npm outdated` | Check for available updates | Weekly |
| **Renovate** | Automated dependency PRs | **Recommended** |

> **Source Anchor (Quelle):** npm audit documentation: https://docs.npmjs.com/cli/v10/commands/npm-audit. "Scans your project's dependencies for security vulnerabilities and suggests fixes."

### Renovate Configuration

The plugin should use Renovate (not Dependabot) for automated dependency updates:

**Why Renovate over Dependabot:**

| Feature | Renovate | Dependabot |
|---------|----------|------------|
| Config-as-code | `renovate.json` | `dependabot.yml` |
| Grouping | Flexible (by scope, by frequency) | Limited |
| Scheduling | Cron, custom schedules | Approx. daily |
| Auto-merge | Yes (with branch protection) | Yes |
| Presets | Extensive shared presets | None |

> **Source Anchor (Quelle):** Renovate Documentation — Why Renovate: https://docs.renovatebot.com/why-renovate/. "Renovate is a Mend product, supporting over 300 automated dependency update platforms and languages."

**Proposed `renovate.json`:**

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "config:recommended",
    "group:allNonMajor",
    ":separateMajorMinor",
    ":automergeDigest",
    ":automergePatch"
  ],
  "schedule": ["before 8am on monday"],
  "labels": ["dependencies"],
  "packageRules": [
    {
      "matchUpdateTypes": ["minor", "patch"],
      "automerge": true
    },
    {
      "matchDepTypes": ["devDependencies"],
      "automerge": true
    },
    {
      "matchPackageNames": ["@opencode-ai/plugin"],
      "labels": ["opencode-sdk"],
      "automerge": false
    }
  ]
}
```

**Update frequency:**

| Dependency type | Check | Action |
|----------------|-------|--------|
| Runtime (zod, js-yaml) | Weekly (Monday) | Manual review for minors, automerge patches |
| Dev (vitest, typescript, eslint) | Weekly | Automerge minor/patch |
| opencode SDK | On release | Manual review — hook API changes are breaking |

### Config Migration Between Versions

| Version change | Migration needed | Mechanism |
|----------------|-----------------|-----------|
| PATCH | No | Backward-compatible |
| MINOR | No (additive only) | New fields are optional with defaults |
| MAJOR | Yes | Migration script + CHANGELOG documenting steps |

The Zod schema validates the config on load. Unknown fields are ignored with a warning, not rejected — allowing forward-compatibility.

## 4. Repository Maintenance

### CI/CD Pipeline

| Stage | Tool | When |
|-------|------|------|
| Lint | `eslint` | Pre-commit + PR |
| Type check | `tsc --noEmit` | Pre-commit + PR |
| Unit tests | `vitest` | PR + main branch |
| Integration tests | `vitest` with opencode mock | PR (if changed) |
| Build | `tsup` (or `tsc`) | PR + main |
| Security audit | `npm audit` | Weekly (Renovate) |

> **Source Anchor (Quelle):** Vitest documentation: https://vitest.dev/. tsup: https://tsup.egoist.dev/.

### Branch Strategy

```
main ← production-ready, protected
  ├── develop ← integration branch
  │    ├── feature/xxx ← feature branches
  │    └── fix/xxx ← bugfix branches
  └── release/vX.Y.Z ← release candidates
```

**Branch protection rules (main):**
- Require pull request before merging
- Require status checks (CI passes)
- Require linear history (no merge commits)
- No direct pushes

### Issue & PR Templates

The repository should include:

| Template | File | Purpose |
|----------|------|---------|
| Bug report | `.github/ISSUE_TEMPLATE/bug.yml` | Structured bug reports |
| Feature request | `.github/ISSUE_TEMPLATE/feature.yml` | Use case + anchor alignment |
| Pull request | `.github/PULL_REQUEST_TEMPLATE.md` | Description, testing, changelog entry |

### Community Guidelines

- `CONTRIBUTING.md` — how to set up dev environment, coding standards, PR workflow
- `CODE_OF_CONDUCT.md` — adapted from Contributor Covenant
- `SECURITY.md` — vulnerability disclosure policy (see Section 5 below)

## 5. Security Vulnerability Management

### Disclosure Policy

The plugin follows **coordinated disclosure** (90-day policy):

```
1. Reporter sends details to security@semantic-anchors.dev (or GH Security Advisory)
2. Maintainer confirms receipt within 48 hours
3. Fix is developed (target: 30 days for critical, 90 days for moderate)
4. Patch is released (PATCH version bump)
5. CVE is published after patch is available
6. Reporter is credited (if desired)
```

> **Source Anchor (Quelle):** GitHub Security Advisories: https://docs.github.com/en/code-security/security-advisories. "Privately report security vulnerabilities, collaborate on a fix, and publish a security advisory." Siehe auch: ISO 29147 (Vulnerability Disclosure).

### Vulnerability Response

| Severity | Response time | Bump | Communication |
|----------|--------------|------|--------------|
| Critical (CVSS 9.0+) | 7 days | PATCH | GH Advisory + email |
| High (CVSS 7.0-8.9) | 14 days | PATCH | GH Advisory |
| Moderate (CVSS 4.0-6.9) | 30 days | PATCH | GH Advisory |
| Low (CVSS <4.0) | 90 days | PATCH (bundled) | Next release |

> **Source Anchor (Quelle):** CVSS v3.1 Specification: https://www.first.org/cvss/v3-1/. "Common Vulnerability Scoring System provides a way to capture the principal characteristics of a vulnerability."

### Supply Chain Security

| Measure | Implementation |
|---------|---------------|
| Lock file | `package-lock.json` committed |
| Dependency scanning | `npm audit` + Renovate |
| SBOM generation | `cyclonedx-bom` or `npm sbom` (npm v10+) |
| Signature verification | npm package signing (v2) |

## 6. ISO 27001 Relevance

> **Disclaimer:** ISO 27001 is an organizational certification, not a product certification. What follows is a mapping of **relevant controls** for the plugin's development and operation, not a claim of ISO 27001 compliance.

### Applicable Controls (ISO 27001:2022 Annex A)

| Control | Relevance to Plugin | Implementation |
|---------|-------------------|----------------|
| **A.5.1** Policies for information security | Plugin operates within the user's security policies (BYOP — Bring Your Own Policy) | Config-based rules are reviewable |
| **A.5.2** Information security roles and responsibilities | Plugin does not manage user accounts or roles | Role-based presets are local-only |
| **A.8.10** Information deletion | Plugin session state is ephemeral (in-memory, lost on restart) | No persistent logs containing PII |
| **A.8.11** Information masking | Plugin must not log secrets or credentials | Config explicitly excludes secrets; logs tool names, not arguments |
| **A.8.12** Data leakage prevention | Plugin must not exfiltrate data via external calls | Zero external HTTP calls (architectural constraint) |
| **A.8.24** Use of cryptography | Plugin does not handle encryption | Not applicable — no secrets stored |
| **A.8.25** Secure development lifecycle | Plugin follows Semantic Anchors methodology + mandatory tests | Covered by process constraints |
| **A.8.28** Secure coding | Mandatory code review, linting, type checking | CI pipeline ensures this |
| **A.8.29** Security testing in development | Unit + integration tests for all enforcement logic | Vitest test suite |
| **A.8.31** Separation of development, test and production environments | CI/CD pipeline separates stages | GitHub Actions per environment |
| **A.8.32** Change management | Release process with CHANGELOG + version bumps | Documented release workflow |
| **A.8.34** Protection of information systems during audit testing | Plugin is not a target of audit testing | N/A — no production server |
| **A.12.6** Technical vulnerability management | Dependency scanning + coordinated disclosure | Renovate + SECURITY.md |
| **A.14.2** Security in development and support processes | Plugin development itself follows anchors methodology | Intent/Negative/Verification anchors for every feature |

> **Source Anchor (Quelle):** ISO 27001:2022 Annex A Control List. https://www.iso.org/standard/27001. Die Controls entstammen dem offiziellen ISO 27001:2022 Standard, Annex A (Reference control objectives and controls).

### What ISO 27001 does NOT require of this plugin

- **No certification:** The plugin is not a product that gets ISO 27001 certified (that's the organization)
- **No audit logs for compliance reporting:** The plugin provides runtime enforcement, not an audit trail
- **No access control system:** Plugin does not authenticate users
- **No encryption layer:** Plugin does not store secrets

### What developers should know

If your organization uses ISO 27001, the plugin is relevant under **A.8.25 (Secure Development)** and **A.12.6 (Vulnerability Management)** — i.e., the same controls that apply to any npm dependency you integrate.
