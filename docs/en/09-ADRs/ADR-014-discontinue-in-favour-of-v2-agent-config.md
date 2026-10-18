# ADR-014: Discontinue the Plugin in Favour of OpenCode V2 Agent Configuration

## Status

Accepted (2026-10-18). Supersedes the runtime enforcement from ADR-001, ADR-002 and ADR-010.

## Context

The catalog [awesome-opencode #514](https://github.com/Heretek-AI/awesome-opencode/issues/514) removes V1-only plugins on 2027-01-01. The plugin depends on `@opencode-ai/plugin` 1.x and exports the V1 function API (ADR-010). Migrating to `@opencode/plugin` 2.x means rebuilding every hook (`execute.before`, prompt hook, tools with Effect Schema instead of zod).

Before rebuilding, we checked what OpenCode V2 provides itself (sources: `@opencode/schema@2.0.32`, `anomalyco/opencode` tag `v2.0.32`):

- **Agent configuration** (`config/agent.d.ts`): `system`, `permissions` (`allow`/`deny`/`ask`), `steps`, `mode`, `model`; globally `instructions`, `skills`, `policies`.
- **Step limit** (`packages/core/src/session/runner/llm.ts`):
  - `const stepLimitReached = loaded.agent.info.steps !== undefined && step >= loaded.agent.info.steps`
  - `toolChoice: stepLimitReached ? "none" : undefined` – tools are disabled at the provider, not just by prompt.
  - `if (promoted > 0) step = 1` – only new user input resets the counter.
  - `MAX_STEPS_PROMPT`: "Tools are disabled until next user input. Respond with text only."

Also open: the `anchor-bypass` tool let the AI skip the step confirmation (`docs/issues/step-confirmation-bypass.md`). Requirement: no bypass, by design.

## Alternatives Considered

- **A – Migrate as one V2 plugin** (baseline): same features, new API.
- **B – Split into two V2 plugins** (`step-confirmation` + `semantic-anchors`), without bypass.
- **C – Discontinue the plugin, replace with V2 agent configuration**: anchors as `system`/`instructions`/`skills`, roles/profiles as agents, tool blocks via `permissions`, step confirmation via `steps` + `system` rule + `permissions: ask`.

### Pugh Matrix (baseline A = 0)

| Criterion | A | B | C |
|---|---|---|---|
| Step confirmation enforced (cannot be skipped) | 0 | + | + |
| Bypass excluded by design | 0 | + | + |
| Maintenance effort (API change, Effect peer dependency) | 0 | − | + |
| Coverage of WARN mode / message content checks | 0 | 0 | − |
| Value for the author (opencode last used 2026-09-06) | 0 | 0 | + |
| **Total** | 0 | +1 | +3 |

## Decision

Option C. The plugin is not migrated and is discontinued:

- npm: `opencode-semantic-anchors@0.1.0` marked deprecated (2026-10-18).
- Replacement: V2 agents with `steps` (hard limit), a `system` rule "stop after each logical step", and `permissions` (`ask` for critical actions, `deny` for forbidden ones).
- Semantic Anchors remain vocabulary and are included as text (`system`, `instructions`, `skills`), as in the Claude Code setup via `CLAUDE.md`.

## Consequences

**Positive**

- Step confirmation without bypass, enforced by OpenCode itself (`toolChoice: "none"`).
- No own code to maintain; no dependency on plugin API changes.
- The open bypass issue is resolved.

**Negative**

- WARN mode and message content checks (e.g. Source Anchor) are dropped. Both were plain text-pattern checks.
- `steps` counts model calls, not logical steps. A logical step remains an instruction in the `system` prompt; `steps` is the hard limit behind it.
- The awesome-opencode catalog entry goes away (by 2027-01-01 at the latest).

**Open**

- Practical test of `steps` with OpenCode V2 (so far source analysis only).
