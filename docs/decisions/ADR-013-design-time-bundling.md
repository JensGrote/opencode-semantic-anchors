# ADR-013: Design-Time Bundling of Anchor Rules (instead of runtime fetch)

## Status
Accepted

## Context
The plugin enforces rules derived from the [LLM-Coding/Semantic-Anchors](https://github.com/LLM-Coding/Semantic-Anchors) repository. These anchor rules (e.g., Step Confirmation, Source Anchor, BLUF) must be available to the `RuleEngine` at runtime.

The Semantic-Anchors repository is the canonical source of truth for anchor definitions. The question is: at which point in the lifecycle should the plugin obtain these definitions?

Two fundamentally different approaches exist:

### Option A: Runtime Fetching
The plugin fetches the latest anchor definitions from the GitHub repository on every startup (or periodically with caching).

```typescript
// Hypothetical runtime-fetch approach
async function loadAnchors(): Promise<AnchorRule[]> {
  const response = await fetch('https://raw.githubusercontent.com/LLM-Coding/Semantic-Anchors/main/anchors.json')
  return response.json()
}
```

**Advantages:**
- Always has the most up-to-date anchor definitions
- No release coordination with Semantic-Anchors repository
- Smaller package size (no bundled defaults)

**Disadvantages:**
- **Runtime dependency on GitHub** — If GitHub is unreachable, the plugin cannot load rules (or must fall back ungracefully)
- **Version skew** — Same plugin version may behave differently depending on when it was last started
- **Latency** — Network request on every startup (or cache invalidation complexity)
- **Offline failure** — Plugin cannot work without internet access
- **Violates Architecture Constraint** ("No external services — All enforcement logic runs locally")

### Option B: Design-Time Bundling (chosen)
Anchor rules are derived from the Semantic-Anchors repository at design time and bundled as a default YAML preset within the npm package.

```yaml
# dist/defaults.yaml (bundled with package)
contracts:
  - id: step-confirmation
    mode: BLOCK
    triggers:
      - type: tool
        pattern: "*"
        count: 3
  - id: source-anchor
    mode: WARN
    triggers:
      - type: tool
        pattern: "write"
```

**Advantages:**
- Zero runtime dependencies — no network calls, no GitHub availability concerns
- Deterministic — plugin version X always enforces anchor set Y
- Offline-capable — all enforcement works without internet
- User autonomy — local config overrides bundled defaults

**Disadvantages:**
- Update lag — users must update the plugin to receive new anchor definitions
- Release coordination — bundled defaults must be updated when upstream changes
- Slightly larger package size (~5KB for defaults)

### Option C: Git Subtree / Submodule
The Semantic-Anchors repository is included as a git subtree in the plugin repository. At build time, anchor definitions are extracted and bundled.

**Advantages:**
- Always tracks a specific commit of upstream
- Easy to update (git subtree pull)
- No runtime dependency

**Disadvantages:**
- Git subtree complexity — merge conflicts, history bloat
- Increases repository size significantly
- Not applicable for npm-published package without git history
- Does not solve the runtime distribution problem — still needs bundling for npm

## Evaluation Criteria

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Runtime independence | Critical | No external network calls during enforcement |
| Determinism | Critical | Same version = same behavior across sessions |
| Offline capability | High | Must work without internet access |
| Update simplicity | Medium | Users should be able to get new rules easily |
| Package size | Low | Impact on npm install size |
| Maintenance burden | Medium | Effort to keep bundled rules current |

## Decision
**Option B: Design-Time Bundling** was chosen.

Anchor rules are included as a bundled default YAML preset (`dist/defaults.yaml`) within the npm package. The `ConfigLoader` reads this file as the fallback when no user config is present at `~/.config/opencode/opencode-semantic-anchors.yaml`.

The bundling process is automated via `scripts/bundle-defaults.sh`, which extracts rules from the Semantic-Anchors subtree and converts them to YAML format. A weekly GitHub Actions workflow checks for upstream changes and creates a PR to update the bundle.

## Consequences

### Positive
- **Zero runtime dependencies** — No HTTP calls, no network failures, no GitHub outage can affect enforcement. Directly satisfies the Architecture Constraint "No external services".
- **Deterministic behavior** — Plugin version X always enforces the same rules. Reproducible across sessions, machines, and team members.
- **Offline-capable** — All enforcement logic works without internet access. No latency or timeout failures.
- **User autonomy** — Local config overrides the bundled defaults without requiring a fork or upstream PR. Users who want custom rules simply create their own `opencode-semantic-anchors.yaml`.
- **Version-pinned updates** — Updating the plugin is an explicit act; rules don't change unexpectedly between sessions.

### Negative
- **Update lag** — Users must update the plugin (npm update) to receive new or modified anchor definitions from upstream. Cannot "live-pull" hotfixes.
- **Release coordination** — The bundled defaults must be updated as part of the release process when the Semantic-Anchors repository adds or modifies anchors. Risk of drift between upstream and bundled version if updates are missed.
- **Package size increase** — ~5KB added to the npm package (negligible in practice).

### Mitigation
- Weekly automated PR via GitHub Actions (`schedule: weekly`) checks the upstream repository for changes and creates an update PR
- The `scripts/bundle-defaults.sh` script is part of the standard release checklist
- The `/anchor config-reload` tool works for both bundled and user configs (no restart needed after config change)
- Users who need immediate upstream changes can copy the bundle from the Semantic-Anchors repo manually

## Related
- Decision 7 in 04-solution-strategy.md (short form of this ADR)
- Architecture Constraint "No external services" in 02-architecture-constraints.md
- `config/loader.ts` in 05-building-block-view.md (ConfigLoader reads bundled defaults)
- ADR-003: YAML Config (chose YAML as config format for these rules)
- ADR-004: Take before Buy before Make (design principle applied here)

## Compliance

| Constraint / Goal | How it's satisfied |
|-------------------|-------------------|
| Architecture Constraint: No external services | Zero network calls at runtime |
| Quality Goal: Reliability (Determinism) | Same version = same rules |
| Quality Goal: Workflow Continuity | No network dependency → no latency/timeout failures |
| Quality Goal: Configuration Clarity | Bundled defaults serve as documented example config |

## Sources
- LLM-Coding/Semantic-Anchors repository: https://github.com/LLM-Coding/Semantic-Anchors
- opencode Architecture Constraint documentation: 02-architecture-constraints.md in this project
- `agentcontract/spec` bundling pattern: https://github.com/agentcontract/spec (ships default contracts as YAML in their package)
