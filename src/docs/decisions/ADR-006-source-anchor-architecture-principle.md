# ADR-006: Source Anchor as Architecture Principle

## Status
Accepted

## Context
The plugin itself follows the Semantic Anchors it enforces. One of these anchors is the **Source Anchor**:

> "Every claim must be verifiable through a literally quoted source. The source (URL, title, author) must be provided."

The question: Should the Source Anchor apply **only** to the LLM (as a rule the plugin enforces), or also **to the architecture documentation of the plugin itself**?

Specifically: Every claim in the design document (arc42) about technologies, decisions, or facts must be substantiated with a verbatim quote from a verifiable source.

## Alternatives Considered

### Option A: Source Anchor only for LLM Steering
The plugin enforces the Source Anchor as a rule (WARN on claims without source), but the design document itself does not have to follow the Source Anchor rule.

**Advantages:**
- Lower writing effort for documentation
- Design document can argue "freely"
- Fewer formal hurdles in the design phase

**Disadvantages:**
- **Contradiction to own methodology** — Plugin preaches Source Anchor but does not apply it itself
- Risk of wrong decisions due to unsubstantiated assumptions
- When contributing to the Semantic-Anchors repo, missing source citations will be noticed
- Loss of credibility ("Do as I say, not as I do")

### Option B: Source Anchor for Architecture Documentation (chosen)
Every claim in the arc42 design document must be verifiable through a literally quoted source.

**Advantages:**
- **Consistency** — The plugin lives what it demands
- Higher decision quality through substantiated facts
- Traceability for reviewers and contributors
- Contribution-ready for Semantic-Anchors repo (standard there as well)
- Avoids speculation ("could be...", "perhaps...", "presumably...")

**Disadvantages:**
- Higher writing effort (every claim must be substantiated)
- Not all claims have a public source (e.g., Issue #518 might be private?)
- Sources can become outdated (404 links)
- Slows down the design phase

### Option C: Source Anchor with Gradated Commitment
Only critical decisions (technology choices, architecture) must be substantiated; descriptive text does not.

**Disadvantages:**
- **Demarcation problem** — what is "critical", what is not?
- Subjective assessment leads to inconsistent application
- Would need to be fixed up at contribution time
- Harder to check than a clear rule

## Evaluation Criteria
| Criterion | Weight | Description |
|-----------|--------|-------------|
| Method consistency | High | Plugin must itself follow what it demands |
| Decision quality | High | Substantiated facts instead of speculation |
| Contribution readiness | Medium | Semantic-Anchors repo expects Source Anchor |
| Writing effort | Low | Should not excessively burden the documentation |
| Traceability | Medium | Reviewers must understand where information comes from |

## Decision
**Option B: Source Anchor for Architecture Documentation** was chosen.

Rationale:
- A plugin that enforces the Source Anchor must live it itself (credibility)
- The Semantic-Anchors repository expects Source Anchor as a standard — contribution requires it anyway
- The quality of design decisions is increased through substantiated facts
- "Do as I do" instead of "Do as I say"
- The effort is well invested in the design phase (prevents later correction loops)

In the design document, each Source Anchor citation is documented with the following format:
> **Source Anchor (Quelle):** <URL>. "<verbatim quote>". Author (if known).

## Consequences
- **Positive:** Every claim in the design is verifiable
- **Positive:** The plugin is contribution-ready for the Semantic-Anchors repo
- **Positive:** Reviewers can trace decisions back to sources
- **Positive:** No speculation or unsubstantiated assumptions in the design
- **Negative:** Higher writing effort (approx. +20% documentation time for source research)
- **Negative:** Sources can become outdated (URLs die) — requires occasional maintenance
- **Negative:** Some "obvious" facts (e.g., "opencode runs on Node.js") must still be substantiated — sometimes feels pedantic
- **Trade-off:** Pedantry against reliability — we accept the pedantry

## Related
- Decision 5 in 04-solution-strategy.md
- 02-architecture-constraints.md (Process Constraints — Source Anchor)
- 01-introduction-and-goals.md (Design Principles — Source Anchor)
- Template: https://github.com/LLM-Coding/Semantic-Anchors/blob/main/docs/anchors/_template.adoc

## Sources
- LLM-Coding/Semantic-Anchors — _template.adoc: https://github.com/LLM-Coding/Semantic-Anchors/blob/main/docs/anchors/_template.adoc
- Source Anchor Definition (assumed path): https://github.com/LLM-Coding/Semantic-Anchors/docs/anchors/source-anchor.adoc
- Semantic-Anchors CLAUDE.md (AsciiDoc commitment): https://github.com/LLM-Coding/Semantic-Anchors/blob/main/CLAUDE.md
