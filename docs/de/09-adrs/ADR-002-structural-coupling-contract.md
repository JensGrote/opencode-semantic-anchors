# ADR-002: Structural Coupling Contract statt direkter Anchor-Enforcement

## Status
Accepted

## Context
Das LLM-Coding/Semantic-Anchors Repository definiert zwei verwandte, aber unterschiedliche Konzepte:

- **Semantic Anchor**: Wissen, das das LLM aus Training kennt (z.B. "Source Anchor" = wörtlich zitieren). Shared Vocabulary.
- **Semantic Contract**: Projekt-lokale, maschinell durchsetzbare Regeln, die auf Anchorn aufbauen *oder* eigenständig definiert sein können.

Unser Plugin muss entscheiden: Bilden wir Anchors direkt als Enforcement-Einheiten ab, oder führen wir eine separate Contract-Ebene ein?

Das Problem:
- Anchors sind **nicht deterministisch** — sie basieren auf LLM-Training, nicht auf Code
- Ein Plugin kann nur **deterministische Regeln** durchsetzen (Tool-Namen, Counts, Pattern)
- Wir brauchen eine Brücke zwischen Anchor-Konzept (was das LLM versteht) und maschineller Enforcement (was das Plugin tut)

## Alternatives Considered

### Option A: Direkte Anchor-Enforcement
Das Plugin implementiert jeden Anchor direkt als Enforcement-Regel:
```yaml
anchors:
  - name: source-anchor
    enforce: WARN
    on: write-without-source
```

**Vorteile:**
- Näher an der Semantic-Anchors-Terminologie
- Weniger Abstraktionsebenen
- Einfachere Config für Anchor-Experten

**Nachteile:**
- **Vermischung von Konzepten** — Anchor = Wissen (LLM), Enforcement = Regel (Plugin)
- Anchor-Update im Semantic-Anchors-Repo würde Plugin-Code-Änderung erzwingen
- Anchors sind nicht deterministisch genug für maschinelle Enforcement
- Keine Möglichkeit für Nicht-Anchor-Regeln (BLUF, MECE, Sprachregeln)

### Option B: Structural Coupling Contract (gewählt)
Eine separate Contract-Ebene, die das "structural coupling" zwischen Anchor-Wissen und maschineller Enforcement herstellt:

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

Der Begriff "Structural Coupling Contract" stammt aus der Systemtheorie (Luhmann) und wurde von JensGrote in Issue #518 des Semantic-Anchors-Repos vorgeschlagen.

**Vorteile:**
- Klare Trennung: Anchor = Wissen (optional referenziert), Contract = Enforcement (aktiv)
- Contracts können ohne Anchor-Referenz existieren (generische Steering Engine)
- Anchor-Updates erfordern keine Plugin-Änderung (nur Config-Update)
- Die RuleEngine matched nur gegen `triggers` (deterministisch), nicht gegen `anchorRefs`

**Nachteile:**
- Zusätzliche Abstraktionsebene
- Höhere kognitive Last beim Erstellen von Configs
- Begriff "Structural Coupling Contract" ist länger und technischer als "Anchor"

### Option C: Beide Begriffe synonym verwenden
"Anchor" und "Contract" werden im Plugin austauschbar verwendet.

**Nachteile:**
- **Nicht konform** zur Semantic-Anchors-Definition (about.adoc, rejected-proposals.adoc)
- Widerspricht der klaren Begriffstrennung im Semantic-Anchors-Repository
- Erzeugt Verwirrung bei Contribution ins Semantic-Anchors-Repo

## Evaluation Criteria
| Kriterium | Gewicht | Beschreibung |
|-----------|---------|--------------|
| Begriffsklarheit | Hoch | Muss der Semantic-Anchors-Definition entsprechen |
| Flexibilität | Hoch | Muss Anchors UND Nicht-Anchor-Regeln abdecken |
| Deterministische Enforcement | Hoch | Engine matched nur gegen deterministische Trigger |
| Wartbarkeit | Mittel | Anchor-Updates ohne Plugin-Code-Änderung |
| Terminologie-Konsistenz | Mittel | Einheitlich im gesamten Design-Dokument |

## Decision
**Option B: Structural Coupling Contract** wurde gewählt.

Begründung:
- Einzige Option, die der Semantic-Anchors-Begriffsdefinition entspricht (Anchor = Wissen ≠ Contract = Enforcement)
- `anchorRefs` ist optional — ermöglicht generische Steering Engine
- RuleEngine matched nur gegen `triggers` (nicht `anchorRefs`) — bleibt deterministisch
- Begriff wurde bereits in Issue #518 als Rename-Vorschlag diskutiert — wir folgen der Diskussion

## Consequences
- **Positiv:** Klare semantische Trennung zwischen Wissen und Durchsetzung
- **Positiv:** Contracts können ohne Anchor-Referenz existieren (BLUF, MECE, etc.)
- **Positiv:** Das Plugin bleibt kompatibel zum Semantic-Anchors-Repository bei Contribution
- **Positiv:** **Context-Effizienz** — Contracts leben im Plugin, nicht im System-Prompt. Der LLM-Context wird nicht durch Steering-Regeln verschmutzt. Enforcement passiert zur Laufzeit via Hooks, nicht via Prompt-Instructions. Das ist ein fundamentale Vorteil gegenüber prompt-basierten Ansätzen (AGENTS.md, Semantic-Anchors Onboarding Skill): kein Token-Verbrauch für Steering-Regeln, kein "Instruction Gluttony", kein Wettbewerb zwischen Task-Context und Steering-Context.
- **Negativ:** Höhere Lernkurve für neue User ("Warum heisst es Contract und nicht Anchor?")
- **Negativ:** Längere Config-Dateien durch zusätzliche `id`- und `description`-Felder
- **Trade-off:** Die zusätzliche Abstraktion wird durch die Flexibilität und Context-Effizienz aufgewogen

## Related
- Entscheidung 2 in 04-solution-strategy.md
- ADR-001: Enforcement via `tool.execute.before`
- ADR-008: `anchorRefs` optional — Generische Steering Engine

## Sources
- LLM-Coding/Semantic-Anchors — docs/about.adoc: Anchor-Definition
- LLM-Coding/Semantic-Anchors — docs/rejected-proposals.adoc: "Terms that don't qualify as semantic anchors can still be useful as Semantic Contracts."
- Issue #370: Anchor vs Contract Evaluierungstabelle: https://github.com/LLM-Coding/Semantic-Anchors/issues/370
- Issue #518 (JensGrote): Rename-Vorschlag "Structural Coupling Contract": https://github.com/LLM-Coding/Semantic-Anchors/issues/518
