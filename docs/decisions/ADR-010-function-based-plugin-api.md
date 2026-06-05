# ADR-010: Function-based Plugin API (instead of `AgentPlugin` Interface)

## Status
Accepted

## Context
The opencode Plugin SDK transitioned between versions 0.58 and 0.59 from an object-based to a function-based API:

### Old API (AgentPlugin)
```typescript
import { AgentPlugin } from '@opencode-ai/plugin'

export default function createPlugin(): AgentPlugin {
  return {
    name: 'opencode-semantic-anchors',
    hooks: { ... },
    tools: [ ... ],
  }
}
```

### New API (Plugin)
```typescript
import type { Plugin, tool } from '@opencode-ai/plugin'

export const opencodeSemanticAnchors: Plugin = async ({ client, $, directory, worktree }) => {
  const config = await loadConfig()
  const engine = new RuleEngine(config)

  return {
    'tool.execute.before': async (input, output) => {
      // throw new Error() to block
    },
    tool: {
      'anchor-bypass': tool({ ... }),
    },
  }
}
```

Our original design (05-building-block-view.md) used the old API. In June 2026 we noticed that the opencode docs only show the function-based API.

The question: Should we migrate to the new API (requires updating all code examples and interfaces) or stick with the old API (compatible, but outdated)?

## Alternatives Considered

### Option A: New Function-based API (chosen)
All code examples in the design document and the future implementation use the new API.

**Advantages:**
- **Future-proof** — opencode continues developing the new API; the old one will eventually be deprecated
- **Factory function** allows initialisation logic (loading config, building engine) directly in the plugin
- `tool()` helper is more type-safe than the old `Tool` interface
- **Access to `client`** for logging (`client.app.log()`)
- Better dependency injection (engine, config held in factory scope)
- opencode documentation only shows this API

**Disadvantages:**
- **No dedicated `chat.message` hook** anymore (must use event system)
- **No `agent.activate` hook** anymore (must use session events)
- Hook signature has changed (`(input, output)` instead of `(ctx)`)
- Tools are registered as object property `tool: { name: tool({...}) }`, not as array
- Migration of all code examples in the design document

### Option B: Old AgentPlugin API
Stick with the old API, as it was still documented at the time of design (May/June 2026).

**Advantages:**
- No changes to existing code examples
- Familiar API (object-based)
- Dedicated hooks for `chat.message` and `agent.activate`

**Disadvantages:**
- **Outdated** — opencode docs only show the new API
- **Risk** — old API could be removed in opencode 1.0
- No access to `client` for logging
- No factory function (initialisation must happen elsewhere)
- No type-safe `tool()` helper

### Option C: Support Both APIs
The plugin detects at runtime which API opencode supports and uses the old or new API accordingly.

**Disadvantages:**
- **Double code paths** — every hook and tool definition would need to exist in two variants
- **High test complexity** — both APIs must be tested
- **Not documented** — opencode officially only supports the new API
- Backward compatibility is opencode's problem, not ours

## Evaluation Criteria
| Criterion | Weight | Description |
|-----------|--------|-------------|
| Future-proofness | High | API must work in opencode 1.0 |
| Type safety | High | Tool definitions should be type-checked |
| Logging capability | High | Plugin must be able to output warnings |
| Initialisation | Medium | Config/engine must be initialised on load |
| Implementation effort | Low | Code examples must be migrated |

## Decision
**Option A: New function-based API** was chosen.

Rationale:
- opencode docs (https://opencode.ai/docs/plugins) only show the new API — the old one is effectively deprecated
- The factory function allows elegant initialisation (load config, build engine) in the plugin scope
- `client.app.log()` is the only way to output warnings (only exists in the new API)
- `tool()` helper is more type-safe than the old `Tool` interface
- Migration of code examples is a one-time effort that pays off in the long term

### API Mapping
| Old | New |
|-----|-----|
| `createPlugin(): AgentPlugin` | `export const MyPlugin: Plugin = async (ctx) => {}` |
| `return { allow: false }` block | `throw new Error()` block |
| `return { allow: true, message }` warn | `client.app.log({ level: "warn", ... })` warn |
| `Tool` Interface | `tool({ description, args, execute })` |
| `hooks: { 'chat.message': fn }` | `event({ type: 'message.updated' })` |
| `hooks: { 'agent.activate': fn }` | `event({ type: 'session.created' })` |
| `tools: [tool1, tool2]` (Array) | `tool: { name1: tool1(), name2: tool2() }` (Object) |

## Consequences
- **Positive:** Future-proof — API is actively developed by opencode
- **Positive:** Type safety through `tool()` helper
- **Positive:** Logging via `client.app.log()` for warnings and errors
- **Positive:** Clean dependency injection through factory scope
- **Positive:** **Context Efficiency** (see ADR-002) — the function-based API with `tool.execute.before` hooks ensures steering rules are evaluated outside the LLM context window. No token consumption, no prompt noise, no Instruction Gluttony.
- **Negative:** Chat message observation only via generic event system (no dedicated hook)
- **Negative:** Role-change detection only via session events
- **Negative:** All code examples in the design document had to be migrated (one-time effort, completed)
- **Trade-off:** Loss of dedicated hooks against future-proof API and Context Efficiency — acceptable, as the event system provides equivalent functionality

### Dependency on ADR-001 (Future Migration Path)

ADR-001 (`tool.execute.before` instead of `permission.ask`) is based on the assumption that `permission.ask` is unstable (Regression Issues #7006, #28066). **Should `permission.ask` be stabilised in a future opencode version**, the negative aspects of this decision change:

| Today (ADR-001 + ADR-010) | With stable `permission.ask` |
|---------------------------|-------------------------------|
| `throw new Error()` = hard block | Could show Permission Dialog with "Allow/Deny" |
| Warnings only in log (`client.app.log`) | Could show UI message + "Continue anyway?" |
| Bypass via Custom Tool (`anchor-bypass`) | Could have native "Override" in Permission Dialog |
| No distinction between "block + bypass" and "block + no bypass" | Permission scope could be more fine-grained |

**Migration Strategy:** Should `permission.ask` become stable, ADR-001 can be revisited. The migration would be:
1. `throw new Error()` → `return { allow: false, reason, overrideTool }` (Permission Dialog)
2. `client.app.log({ level: "warn" })` → `return { allow: true, message }` (UI Warning)
3. `anchor-bypass` Custom Tool → integrated override mechanism

**Migration effort:** Medium. The hook logic (evaluate → verdict) stays the same, only the interface changes. The rest of ADR-010 (factory function, `tool()` helper, `client` access) remains valid independently.

## Related
- ADR-001: Enforcement via `tool.execute.before` (Mapping: throw instead of return)
- ADR-001 mentions: "Should `permission.ask` stabilise in a future version, migrating to the native system could become attractive"
- 05-building-block-view.md (all code examples migrated)
- 06-runtime-view.md (4 sequence diagrams migrated)
- 02-architecture-constraints.md (constraint updated)
- opencode Plugin SDK: https://opencode.ai/docs/plugins

## Sources
- opencode Plugin SDK — Basic Structure: https://opencode.ai/docs/plugins#basic-structure
- opencode Plugin SDK — Custom Tools: https://opencode.ai/docs/plugins#custom-tools
- opencode Plugin SDK — Logging: https://opencode.ai/docs/plugins#logging
- opencode Plugin SDK — Events: https://opencode.ai/docs/plugins#events
