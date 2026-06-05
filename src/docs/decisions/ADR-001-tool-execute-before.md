# ADR-001: Enforcement via `tool.execute.before` instead of `permission.ask`

## Status
Accepted

## Context
The opencode Plugin SDK offers two hooks to influence tool execution:

1. **`permission.ask`** — Called before every tool execution. Can allow or block execution. The user sees a permission dialog.
2. **`tool.execute.before`** — Also called before every tool execution. Can use `throw new Error()` to block, or allow the execution to proceed.

Our plugin needs a reliable mechanism to:
- Block tool calls on step-confirmation violations
- Issue warnings on source-anchor violations
- Provide a bypass mechanism (`/anchor bypass`)

The mechanism must be stable and reliable, otherwise the plugin risks "silent ignore".

## Alternatives Considered

### Option A: `permission.ask` Hook
The `permission.ask` hook is called by opencode when a tool requires a specific permission. The plugin could block here.

**Advantages:**
- Natively designed for permission checks
- User sees a permission dialog

**Disadvantages:**
- **Unstable in current opencode** — Regression Issues #7006 and #28066
- Permission dialog is not our UX model (we want BLOCK+overrideTool, not Permission-Grant)
- opencode development has repeatedly broken `permission.ask` (regressions)

### Option B: `tool.execute.before` Hook
The `tool.execute.before` hook fires before every tool call. The plugin can block via `throw new Error()`.

**Advantages:**
- **Stable** — no known regressions
- Throw is cleanly caught by opencode and displayed as an error message
- Allows custom logic (bypass check, warning logging) before the throw
- Allows Custom Tool `anchor-bypass` as a separate mechanism

**Disadvantages:**
- `throw new Error()` is a "hard" block — there is no "soft block with override option" in the SDK
- Warnings (allow + message) must be done via `client.app.log()`, not via return value
- No native support for `overrideTool` (must be solved via Custom Tool)

### Option C: Combination (both hooks)
Use both hooks for different purposes.

**Disadvantages:**
- Double complexity
- `permission.ask` is unstable — would force us to constantly keep up
- Two hooks = two sources of errors

## Evaluation Criteria
| Criterion | Weight | Description |
|-----------|--------|-------------|
| Stability | High | The hook must remain stable across opencode releases |
| Block capability | High | Must reliably block violations |
| Warning capability | Medium | Should be able to issue warnings |
| Bypass mechanism | Medium | User must be able to overcome a block |
| Simplicity | Low | One hook is better than two |

## Decision
**Option B: `tool.execute.before`** was chosen.

Rationale:
- Stability takes precedence over UX convenience (`permission.ask` is unreliable)
- `throw new Error()` blocks reliably and is displayed cleanly by opencode
- Custom Tool `anchor-bypass` replaces the `overrideTool` mechanism
- Warnings are implemented via `client.app.log()`
- One hook = lower error susceptibility

## Consequences
- **Positive:** Stable block mechanism, independent of opencode regressions in the permission system
- **Positive:** Clear separation: BLOCK = throw, WARN = log
- **Negative:** No `overrideTool` concept in the SDK — bypass must be implemented entirely independently
- **Negative:** Warnings only appear in the log, not as a UI message (UX loss compared to a hypothetical `allow + message`)
- **Negative:** Should `permission.ask` stabilise in a future version, migrating to the native system could become attractive
- **Dependency:** ADR-010 (Function-based Plugin API) describes the concrete migration path should `permission.ask` become stable — see "Dependency on ADR-001" in ADR-010

## Related
- Decision 1 in 04-solution-strategy.md
- 02-architecture-constraints.md (Technical Constraints)
- ADR-002: Structural Coupling Contract instead of direct Anchor Enforcement
- ADR-010: Function-based Plugin API (Future Migration Path with stable permission.ask)

## Sources
- opencode GitHub Issue #7006: https://github.com/opencode-ai/opencode/issues/7006
- opencode GitHub Issue #28066: https://github.com/opencode-ai/opencode/issues/28066
- opencode Plugin SDK — Events: https://opencode.ai/docs/plugins#events
- opencode Plugin SDK — .env protection example: https://opencode.ai/docs/plugins#env-protection
