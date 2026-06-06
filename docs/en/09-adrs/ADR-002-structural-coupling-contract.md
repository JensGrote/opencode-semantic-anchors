# ADR-002: Structural Coupling Contract instead of Direct Anchor Enforcement

## Status
Accepted

## Context
The LLM-Coding/Semantic-Anchors Repository defines two related but distinct concepts:

- **Semantic Anchor**: Knowledge the LLM knows from training (e.g., "Source Anchor" = cite verbatim). Shared vocabulary.
- **Semantic Contract**: Project-local, machine-enforceable rules that build on anchors *or* can be defined independently.

Our plugin must decide: Do we map anchors directly as enforcement units, or do we introduce a separate contract layer?

The problem:
- Anchors are **not deterministic** — they are based on LLM training, not on code
- A plugin can only enforce **deterministic rules** (tool names, counts, patterns)
- We need a bridge between anchor concept (what the LLM understands) and machine enforcement (what the plugin does)

## Alternatives Considered

### Option A: Direct Anchor Enforcement
The plugin implements each anchor directly as an enforcement rule:
```yaml
anchors:
  - name: source-anchor
    enforce: WARN
    on: write-without-source
```

**Advantages:**
- Closer to the Semantic-Anchors terminology
- Fewer abstraction layers
- Simpler config for anchor experts

**Disadvantages:**
- **Mixing of concepts** — Anchor = knowledge (LLM), Enforcement = rule (plugin)
- Anchor update in the Semantic-Anchors repo would force a plugin code change
- Anchors are not deterministic enough for machine enforcement
- No ability for non-anchor rules (BLUF, MECE, language rules)

### Option B: Structural Coupling Contract (chosen)
A separate contract layer that establishes the "structural coupling" between anchor knowledge and machine enforcement:

```yaml
contracts:
  - id: step-confirmation
    mode: BLOCK
    description: "Requires explicit confirmation every N tool calls"
    anchorRefs: ["step-confirmation-anchor"]  # optional
    triggers:
      - type: tool
        pattern: "*"
        count: 3
```

The term "Structural Coupling Contract" originates from systems theory (Luhmann) and was proposed by JensGrote in Issue #518 of the Semantic-Anchors repository.

**Advantages:**
- Clear separation: Anchor = knowledge (optional reference), Contract = enforcement (active)
- Contracts can exist without anchor reference (generic steering engine)
- Anchor updates require no plugin change (only config update)
- The RuleEngine matches only against `triggers` (deterministic), not `anchorRefs`

**Disadvantages:**
- Additional abstraction layer
- Higher cognitive load when creating configs
- The term "Structural Coupling Contract" is longer and more technical than "Anchor"

### Option C: Use Both Terms Synonymously
"Anchor" and "Contract" are used interchangeably in the plugin.

**Disadvantages:**
- **Not compliant** with the Semantic-Anchors definition (about.adoc, rejected-proposals.adoc)
- Contradicts the clear term separation in the Semantic-Anchors repository
- Creates confusion when contributing to the Semantic-Anchors repo

## Evaluation Criteria
| Criterion | Weight | Description |
|-----------|--------|-------------|
| Term clarity | High | Must conform to the Semantic-Anchors definition |
| Flexibility | High | Must cover anchors AND non-anchor rules |
| Deterministic enforcement | High | Engine matches only against deterministic triggers |
| Maintainability | Medium | Anchor updates without plugin code changes |
| Terminology consistency | Medium | Consistent throughout the entire design document |

## Decision
**Option B: Structural Coupling Contract** was chosen.

Rationale:
- Only option that conforms to the Semantic-Anchors term definition (Anchor = knowledge ≠ Contract = enforcement)
- `anchorRefs` is optional — enables generic steering engine
- RuleEngine matches only against `triggers` (not `anchorRefs`) — remains deterministic
- The term was already discussed in Issue #518 as a rename proposal — we follow the discussion

## Consequences
- **Positive:** Clear semantic separation between knowledge and enforcement
- **Positive:** Contracts can exist without anchor reference (BLUF, MECE, etc.)
- **Positive:** The plugin remains compatible with the Semantic-Anchors repository on contribution
- **Positive:** **Context Efficiency** — Contracts live in the plugin, not in the system prompt. The LLM context is not polluted by steering rules. Enforcement happens at runtime via hooks, not via prompt instructions. This is a fundamental advantage over prompt-based approaches (AGENTS.md, Semantic-Anchors Onboarding Skill): no token consumption for steering rules, no "Instruction Gluttony", no competition between task context and steering context.
- **Negative:** Higher learning curve for new users ("Why is it called Contract and not Anchor?")
- **Negative:** Longer config files due to additional `id` and `description` fields
- **Trade-off:** The additional abstraction is offset by flexibility and context efficiency

## Related
- Decision 2 in 04-solution-strategy.md
- ADR-001: Enforcement via `tool.execute.before`
- ADR-008: `anchorRefs` optional — Generic Steering Engine

## Sources
- LLM-Coding/Semantic-Anchors — docs/about.adoc: Anchor definition
- LLM-Coding/Semantic-Anchors — docs/rejected-proposals.adoc: "Terms that don't qualify as semantic anchors can still be useful as Semantic Contracts."
- Issue #370: Anchor vs Contract evaluation table: https://github.com/LLM-Coding/Semantic-Anchors/issues/370
- Issue #518 (JensGrote): Rename proposal "Structural Coupling Contract": https://github.com/LLM-Coding/Semantic-Anchors/issues/518
