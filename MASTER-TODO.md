# opencode-semantic-anchors — MASTER-TODO

## Phase 1 ✅ — Design
- arc42 document (9 sections, 12 ADRs)
- All reviews passed

## Phase 2 ✅ — Prototype
- 81 tests, 9 test files, 0 failures, 0 TS errors
- Full pipeline: Config→Engine→Hooks→Tools

## Phase 3 — Profile System & Enforcement

### Feature 1: Role-based Presets ✅ (2026-06-05)
- `roleProfiles` config field + Zod schema
- Built-in `ROLE_PROFILES` for 14 roles
- `getRoleProfiles()` with fallback hierarchy
- `ContractResolver` engine integration
- Dynamic contract reloading on `setRole()`
- 10 new tests, all 81 passing

### Feature 2: Config Runtime-Validierung ⬜
### Feature 3: agent.activate via Event-System ⬜

## Known Issues / Blocked
- Architecture profile contracts depend on user's PR being merged first
- `agent.activate` not available as dedicated hook in current plugin SDK
