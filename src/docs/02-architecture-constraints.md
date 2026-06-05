# 2. Architecture Constraints

## Technical Constraints

| Constraint | Description |
|------------|-------------|
| Plugin SDK | Must implement the opencode `Plugin` type (function-based API) with `tool.execute.before` hook and `tool` definitions |
| Language | TypeScript/JavaScript (opencode plugin SDK is JS-native) |
| Config format | File-based YAML loaded from opencode config directory. No database. |
| Runtime dependencies | Zero external HTTP calls. All enforcement logic runs locally. Must work fully offline. |
| No secrets | Plugin never handles passwords, tokens, or API keys. No integration with age or other secret stores. |
| Hook limitation | `permission.ask` hook is unstable in current opencode (regression issues #7006, #28066). All enforcement must use `tool.execute.before` as the primary hook. |

## Business Constraints

| Constraint | Rationale |
|------------|-----------|
| Open-source (MIT) | Contribution target is LLM-Coding/Semantic-Anchors repo which is MIT-licensed |
| Coexists with prompt instructions | Plugin amplifies AGENTS.md rules — does not replace them. Both layers work together. |
| Ships with role-based presets | Must be useful out-of-the-box for the 12 Semantic-Anchors roles |
| Local-first | v1 is `.opencode/plugin/` local install. npm publish is v2. |

## Organizational Constraints

| Constraint | Source | Description |
|------------|--------|-------------|
| No performance monitoring | Works Council | Plugin must not be used to measure individual developer performance. Aggregated, anonymized metrics only. |
| Policy review required | Works Council | Steering rules must be reviewable before deployment. "Policy as Code" must be human-readable. |
| GDPR-compliant logging | Data Privacy Officer | Bypass and violation logs must not contain personally identifiable information (PII) beyond what opencode already captures. |
| Audit trail for compliance | Compliance Officer | Steering violations and bypasses must be logged with timestamp, rule ID, and tool name — but not developer identity. |

## Process Constraints

| Constraint | Description |
|------------|-------------|
| Anchor-first development | The plugin's own development must follow the Semantic Anchors methodology (Intent, Negative, Verification, Source anchors). |
| Source Anchor: read docs, cite verbatim | Every claim must be verifiable through a verbatim quoted source. No speculation about error causes or concepts without a source citation. |
| Take before Buy before Make | Before writing any code, check whether an existing solution exists (including forks, open-source components, integration of existing parts). Custom development is the last resort. |
| Tests mandatory | Every rule and hook must have corresponding unit tests. Enforcement logic must be verifiable. |
| Step Confirmation | Every design/implementation step requires explicit user confirmation ("Weiter?") before proceeding. |
| Markdown for design docs, .adoc only at contribution | Design documents are written in `.md` (more efficient). Conversion to `.adoc` occurs only at contribution time to the LLM-Coding/Semantic-Anchors repository, which mandates AsciiDoc. |
