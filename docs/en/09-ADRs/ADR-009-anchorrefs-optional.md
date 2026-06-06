# ADR-009: `anchorRefs` Optional — Generic Steering Engine

## Status
Accepted

## Context
The plugin uses `StructuralCouplingContract` as its central rule unit. This interface has a field `anchorRefs` that references Semantic Anchors.

The question: Should `anchorRefs` be **required** (every contract must reference a Semantic Anchor) or **optional** (contracts can also exist without anchor reference)?

Specifically: If a user wants to define a rule "always respond in German", do they have to invent a Semantic Anchor, or can they define the rule without an anchor reference?

Initial situation:
- The `RuleEngine.evaluate()` only matches against `triggers` (tool pattern, message pattern, count)
- `anchorRefs` is **never evaluated** by the engine — it is purely metadata documentation
- The Zod schema definition in `05-building-block-view.md` had `anchorRefs` as required originally (`z.array(z.string())`)

## Alternatives Considered

### Option A: `anchorRefs` Required
Every contract must reference at least one Semantic Anchor.

```yaml
contracts:
  - id: step-confirmation
    mode: BLOCK
    anchorRefs: ["step-confirmation-anchor"]  # required
    triggers:
      - type: tool
        pattern: "*"
        count: 3
```

**Advantages:**
- **Clear positioning** as a Semantic Anchors plugin
- Every rule is explainable via an anchor definition
- Beginners learn the method through the requirement to reference an anchor
- Documentation is simpler (always an anchor named)

**Disadvantages:**
- **Artificial anchor invention** — Users would have to invent or shoehorn an anchor for "always respond in German"
- **Non-anchor rules excluded** — BLUF, MECE, language rules, Take-Buy-Make are not Semantic Anchors
- `anchorRefs` is ignored by the engine — a required declaration would be a "lie in the schema"
- Increases the entry barrier (users must learn anchor terminology before defining a simple rule)

### Option B: `anchorRefs` Optional (chosen)
`anchorRefs` is an optional metadata field. Contracts without `anchorRefs` are explicitly allowed.

```yaml
contracts:
  - id: step-confirmation
    mode: BLOCK
    anchorRefs: ["step-confirmation-anchor"]  # optional
    triggers: ...

  - id: german-response
    mode: WARN
    description: "Always respond in German"
    # no anchorRefs — standalone steering rule
    triggers:
      - type: message
        pattern: ".*"
```

**Advantages:**
- **Honest schema** — `anchorRefs` is not evaluated, so it must be optional
- **Flexible** — Generic Steering Engine + Semantic Anchors Presets
- **Low entry barrier** — Users can start with simple rules and learn anchors later
- Future-proof — rules that do not correspond to any anchor today can still be defined

**Disadvantages:**
- **Less methodological pressure** — Users can use the plugin without understanding Semantic Anchors
- **"Arbitrariness"** — without anchor reference, it is unclear why a rule exists
- **Documentation must explain both cases** (with and without anchorRefs)

### Option C: No `anchorRefs` Field
The contract interface has no `anchorRefs` field at all. The connection to Semantic Anchors is not documented in the contract.

**Disadvantages:**
- **No connection** to the Semantic-Anchors ecosystem
- Contribution to the Semantic-Anchors repo would be harder to justify
- Plugin would be "just" a generic steering tool without methodological anchor
- Misses the opportunity to make Semantic Anchors known through the config

## Evaluation Criteria
| Criterion | Weight | Description |
|-----------|--------|-------------|
| Schema honesty | High | A field that is never evaluated should not be required |
| Flexibility | High | Non-anchor rules must also be representable |
| Entry barrier | Medium | Users should be able to become productive quickly |
| Method consistency | Medium | Semantic Anchors should remain visible |
| Future-proofing | Low | Even unknown rule types must fit |

## Decision
**Option B: `anchorRefs` optional** was chosen.

Rationale:
- The schema does not lie: `anchorRefs` is not evaluated by the engine → it must not be required
- The flexibility for non-anchor rules is a decisive advantage (BLUF, MECE, language rules)
- The connection to Semantic Anchors is preserved (optional, but documented)
- No engine change is needed (matches only against `triggers`)
- Users can start with simple rules and learn anchors later

## Consequences
- **Positive:** The Zod schema reflects reality (optional metadata field)
- **Positive:** Users can define project-specific rules without anchor knowledge
- **Positive:** The engine stays simple (matches only against triggers)
- **Positive:** Semantic Anchors remain visible as optional knowledge anchor
- **Negative:** Users can use the plugin without ever understanding a Semantic Anchor
- **Negative:** With many contracts without anchorRefs, the methodological coherence suffers
- **Negative:** Documentation must explain two use cases (with/without anchorRefs)
- **Trade-off:** Methodological rigour against practical flexibility — flexibility wins

### Negative Mitigation
The trade-off (flexibility vs. methodological rigour) is addressed through **explicit documentation** in installation and README:

1. **Installation docs** (`docs/08-concepts/01-installation.md` and future README.md):
   - Primary example shows contracts **with** `anchorRefs` (Best Practice)
   - Secondary example shows contracts **without** `anchorRefs` (for project-specific rules)
   - Explicit note: "`anchorRefs` is optional, but recommended — it documents which Semantic Anchor justifies the rule"

2. **YAML config comment** (in the default config template):
   ```yaml
   # anchorRefs: optional, but recommended
   # References the Semantic Anchor that justifies this rule.
   # If anchorRefs is missing, this is a project-specific
   # steering rule without anchor reference.
   ```

3. **CLI output of `/anchor status`**:
   ```
   Active Contracts:
   - step-confirmation  (BLOCK)  ← anchor: step-confirmation-anchor
   - german-response    (WARN)   ← [no anchor ref]
   ```

This makes it clear: Contracts without `anchorRefs` are explicitly allowed, but visible as "rules without methodological anchor".

## Related
- ADR-002: Structural Coupling Contract (Contract vs Anchor separation)
- Decision discussed in Session 2026-06-04
- Zod schema in 05-building-block-view.md (adapted to `.optional()`)
- 04-solution-strategy.md (Decision 2: optional)

## Sources
- Zod `.optional()` documentation: https://zod.dev/?id=optional
- LLM-Coding/Semantic-Anchors — rejected-proposals.adoc: "Terms that don't qualify as semantic anchors can still be useful as Semantic Contracts."
