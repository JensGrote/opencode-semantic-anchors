# ADR-009: `anchorRefs` optional — Generische Steering Engine

## Status
Accepted

## Context
Das Plugin verwendet `StructuralCouplingContract` als zentrale Regel-Einheit. Dieses Interface hat ein Feld `anchorRefs`, das auf Semantic Anchors verweist.

Die Frage: Soll `anchorRefs` **required** sein (jeder Contract muss einen Semantic Anchor referenzieren) oder **optional** (Contracts können auch ohne Anchor-Referenz existieren)?

Konkret: Wenn ein User eine Regel "immer Deutsch antworten" definieren will, muss er dafür einen Semantic Anchor erfinden, oder kann er die Regel ohne Anchor-Referenz definieren?

Ausgangslage:
- Die `RuleEngine.evaluate()` matched nur gegen `triggers` (tool pattern, message pattern, count)
- `anchorRefs` wird von der Engine **nie ausgewertet** — es ist reine Metadaten-Dokumentation
- Die Zod-Schema-Definition in `05-building-block-view.md` hatte `anchorRefs` ursprünglich als required (`z.array(z.string())`)

## Alternatives Considered

### Option A: `anchorRefs` required
Jeder Contract muss mindestens einen Semantic Anchor referenzieren.

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

**Vorteile:**
- **Klare Positionierung** als Semantic Anchors Plugin
- Jede Regel ist per Anchor-Definition erklärbar
- Einsteiger lernen durch die Pflicht zur Anchor-Referenz die Methode
- Doku ist einfacher (immer ein Anchor genannt)

**Nachteile:**
- **Künstliche Anchor-Erfindung** — User müssen für "antwort immer Deutsch" einen Anchor erfinden oder auf einen passenden biegen
- **Nicht-Anchor-Regeln ausgeschlossen** — BLUF, MECE, Sprachregeln, Take-Buy-Make sind keine Semantic Anchors
- `anchorRefs` wird von der Engine ignoriert — eine required-Deklaration wäre "Lüge im Schema"
- Erhöht die Einstiegshürde (User müssen Anchor-Terminologie lernen, bevor sie eine einfache Regel definieren können)

### Option B: `anchorRefs` optional (gewählt)
`anchorRefs` ist ein optionales Metadaten-Feld. Contracts ohne `anchorRefs` sind explizit erlaubt.

```yaml
contracts:
  - id: step-confirmation
    mode: BLOCK
    anchorRefs: ["step-confirmation-anchor"]  # optional
    triggers: ...

  - id: german-response
    mode: WARN
    description: "Always respond in German"
    # kein anchorRefs — standalone Steering-Regel
    triggers:
      - type: message
        pattern: ".*"
```

**Vorteile:**
- **Ehrliches Schema** — `anchorRefs` wird nicht ausgewertet, also ist es optional
- **Flexibel** — Generic Steering Engine + Semantic Anchors Presets
- **Niedrige Einstiegshürde** — User kann erstmal einfache Regeln definieren, später Anchors lernen
- Future-Proof — auch Regeln, die heute keinem Anchor entsprechen, sind abbildbar

**Nachteile:**
- **Weniger methodischer Druck** — User können das Plugin nutzen, ohne Semantic Anchors zu verstehen
- **"Beliebigkeit"** — ohne Anchor-Referenz wird nicht klar, warum eine Regel existiert
- **Doku muss beide Fälle erklären** (mit und ohne anchorRefs)

### Option C: Kein `anchorRefs`-Feld
Das Contract-Interface hat gar kein `anchorRefs`-Feld. Die Verbindung zu Semantic Anchors wird nicht im Contract dokumentiert.

**Nachteile:**
- **Keine Verbindung** zum Semantic-Anchors-Ecosystem
- Contribution ins Semantic-Anchors-Repo wäre schwerer zu begründen
- Plugin wäre "nur" ein generisches Steering-Tool ohne Methodenanker
- Verpasst die Chance, Semantic Anchors durch die Config bekannt zu machen

## Evaluation Criteria
| Kriterium | Gewicht | Beschreibung |
|-----------|---------|--------------|
| Schema-Ehrlichkeit | Hoch | Ein Feld, das nie ausgewertet wird, sollte nicht required sein |
| Flexibilität | Hoch | Auch Nicht-Anchor-Regeln müssen abbildbar sein |
| Einstiegshürde | Mittel | User soll schnell produktiv werden können |
| Methoden-Konsistenz | Mittel | Semantic Anchors sollen sichtbar bleiben |
| Zukunftssicherheit | Niedrig | Auch unbekannte Regel-Typen müssen passen |

## Decision
**Option B: `anchorRefs` optional** wurde gewählt.

Begründung:
- Das Schema lügt nicht: `anchorRefs` wird von der Engine nicht ausgewertet → es darf nicht required sein
- Die Flexibilität für Nicht-Anchor-Regeln ist ein entscheidender Vorteil (BLUF, MECE, Sprachregeln)
- Die Verbindung zu Semantic Anchors bleibt erhalten (optional, aber dokumentiert)
- Engine-Änderung ist nicht nötig (matched nur gegen `triggers`)
- User können mit einfachen Regeln starten und später Anchors lernen

## Consequences
- **Positiv:** Das Zod-Schema bildet die Realität ab (optionales Metadaten-Feld)
- **Positiv:** User können projekt-spezifische Regeln ohne Anchor-Wissen definieren
- **Positiv:** Die Engine bleibt einfach (matched nur gegen triggers)
- **Positiv:** Semantic Anchors bleiben als optionaler Wissensanker sichtbar
- **Negativ:** User können das Plugin nutzen, ohne je einen Semantic Anchor zu verstehen
- **Negativ:** Bei vielen Contracts ohne anchorRefs leidet der methodische Zusammenhang
- **Negativ:** Doku muss zwei Anwendungsfälle erklären (mit/ohne anchorRefs)
- **Trade-off:** Methodenstrenge gegen praktische Flexibilität — Flexibilität gewinnt

### Negative Mitigation
Der Trade-off (Flexibilität vs. Methodenstrenge) wird durch **harte Dokumentation** in Installation und README adressiert:

1. **Installations-Doku** (`docs/concepts/01-installation.md` und zukünftiges README.md):
   - Primäres Beispiel zeigt Contracts **mit** `anchorRefs` (Best Practice)
   - Sekundäres Beispiel zeigt Contracts **ohne** `anchorRefs` (für projekt-spezifische Regeln)
   - Expliziter Hinweis: "`anchorRefs` ist optional, aber empfohlen — es dokumentiert, welcher Semantic Anchor die Regel begründet"

2. **YAML-Config-Kommentar** (im Default-Config-Template):
   ```yaml
   # anchorRefs: optional, aber empfohlen
   # Verweist auf den Semantic Anchor, der diese Regel begründet.
   # Fehlt anchorRefs, handelt es sich um eine projekt-spezifische
   # Steering-Regel ohne Anchor-Referenz.
   ```

3. **CLI-Output von `/anchor status`**:
   ```
   Active Contracts:
   - step-confirmation  (BLOCK)  ← anchor: step-confirmation-anchor
   - german-response    (WARN)   ← [no anchor ref]
   ```

Damit wird klar: Contracts ohne `anchorRefs` sind explizit erlaubt, aber als "Regel ohne methodischen Anchor" sichtbar.

## Related
- ADR-002: Structural Coupling Contract (Contract vs Anchor-Trennung)
- Entscheidung diskutiert in Session 2026-06-04
- Zod-Schema in 05-building-block-view.md (angepasst auf `.optional()`)
- 04-solution-strategy.md (Entscheidung 2: optional)

## Sources
- Zod `.optional()` documentation: https://zod.dev/?id=optional
- LLM-Coding/Semantic-Anchors — rejected-proposals.adoc: "Terms that don't qualify as semantic anchors can still be useful as Semantic Contracts."
