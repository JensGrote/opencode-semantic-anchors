# ADR-003: YAML-Config statt JSON/AsciiDoc

## Status
Accepted

## Context
Das Plugin braucht ein Konfigurationsformat für Steering-Regeln. Die Config wird vom User geschrieben und von der `ConfigLoader`-Komponente gelesen. Anforderungen:

- **Lesbarkeit**: Muss einfach von Menschen geschrieben werden können (kein Expertenwissen)
- **Diff-freundlichkeit**: Eine geänderte Regel = eine Zeile Diff
- **Validierbarkeit**: Muss gegen ein Schema prüfbar sein (Zod)
- **Kommentare**: User müssen Regeln kommentieren/deaktivieren können
- **Ecosystem Alignment**: Soll mit existierenden Standards kompatibel sein

## Alternatives Considered

### Option A: JSON
```json
{
  "contracts": [
    {
      "id": "step-confirmation",
      "mode": "BLOCK",
      "triggers": [{"type": "tool", "pattern": "*", "count": 3}]
    }
  ]
}
```

**Vorteile:**
- Von Zod nativ unterstützt (JSON.parse)
- Weit verbreitet, jede Sprache kann JSON lesen
- Strenges Format (keine interpretierten Werte)

**Nachteile:**
- **Keine Kommentare** — User können Regeln nicht auskommentieren
- **Schlechte Diff-Lesbarkeit** — besonders bei verschachtelten Objekten
- Trailing commas nicht erlaubt (Fehlerquelle)
- User müssen Anführungszeichen um Keys setzen (unnötige Tipparbeit)
- Mehr Syntax-"Rauschen" als YAML für vergleichbare Strukturen

### Option B: YAML (gewählt)
```yaml
contracts:
  - id: step-confirmation
    mode: BLOCK
    # Temporary disabled:
    # - id: source-anchor
    triggers:
      - type: tool
        pattern: "*"
        count: 3
```

**Vorteile:**
- **Kommentare** mit `#` — Regeln können deaktiviert werden, ohne gelöscht zu werden
- **Hervorragende Diff-Lesbarkeit** — eine Zeile Änderung = eine Zeile Diff
- Leichter zu schreiben (keine Quotes um Keys, weniger Klammern)
- Bereits etabliert für vergleichbare Agent-Steering-Formate:
  - `agentcontract/spec` verwendet `.contract.yaml`
  - Kiros `/steering` verwendet YAML
- Von `js-yaml` Bibliothek nativ geparst
- Lässt sich mit Zod validieren (nach YAML→JS-Objekt-Transformation)

**Nachteile:**
- **Significant Whitespace** — Einrückungsfehler führen zu Parse-Fehlern
- Nicht von Haus aus typsicher (Zod-Schema validation fängt das ab)
- Weniger strikt als JSON (leere Werte werden zu `null`)
- `js-yaml` als zusätzliche Runtime-Dependency

### Option C: AsciiDoc (.adoc)
Format des Semantic-Anchors-Repos. Könnte als natives Config-Format dienen.

**Nachteile:**
- **Kein strukturiertes Datenformat** — AsciiDoc ist für Dokumentation, nicht für Konfiguration
- Keine standardisierte Schema-Validierung
- Müsste mit Regex/ADoc-Parser geparst werden (kein Zod-Support)
- Weit weniger verbreitet für Config-Zwecke
- Würde Contribution ins Semantic-Anchors-Repo zwar erleichtern, aber die User-Experience verschlechtern

### Option D: opencode.jsonc (JSON mit Kommentaren)
opencode verwendet selbst `opencode.jsonc` als Config-Format.

**Nachteile:**
- **Positionierung**: Plugin-Config soll getrennt von opencode-Config sein (eigene Datei)
- `.jsonc` (JSON with Comments) hat keinen nativen Parser — müsste Stripping vor JSON.parse
- Weniger verbreitet als YAML für Steering-Regeln
- `agentcontract/spec` und Kiros nutzen ebenfalls YAML — Alignment wichtiger als opencode-Konvention

## Evaluation Criteria
| Kriterium | Gewicht | Beschreibung |
|-----------|---------|--------------|
| Lesbarkeit | Hoch | Einfach von Menschen schreib- und lesbar |
| Diff-freundlichkeit | Hoch | Geringe Diff-Grösse bei Einzeländerungen |
| Kommentare | Hoch | User müssen Regeln deaktivieren können |
| Schema-Validierbarkeit | Hoch | Muss mit Zod prüfbar sein |
| Ecosystem-Alignment | Mittel | Soll mit agentcontract/spec etc. harmonieren |
| Typensicherheit | Mittel | Falsche Typen sollen early erkannt werden |

## Decision
**Option B: YAML** wurde gewählt.

Begründung:
- Einzige Option mit Kommentaren + Diff-Freundlichkeit + Schema-Validierung
- Alignment mit `agentcontract/spec` (YAML) und Kiros (YAML) ist strategisch wichtiger als Alignment mit opencode (JSONC)
- `js-yaml` + Zod bieten ausreichende Typsicherheit
- Einrückungsprobleme werden durch Zod-Schema-Fehler early erkannt

## Consequences
- **Positiv:** User können Regeln auskommentieren (Feature, das JSON nicht bietet)
- **Positiv:** Geringe Diff-Grösse bei Config-Änderungen
- **Positiv:** Alignment mit `agentcontract/spec` und Kiros
- **Negativ:** Zusätzliche Dependency (`js-yaml`)
- **Negativ:** Einrückungsfehler sind häufige Fehlerquelle für YAML-Anfänger
- **Negativ:** Kein 1:1-Mapping zu opencode-Config-Format (zwei verschiedene Formate im Setup)
- **Trade-off:** YAML + Zod-Schema = etwas mehr Komplexität beim Laden, aber bessere UX beim Schreiben

## Related
- Entscheidung 3 in 04-solution-strategy.md
- `config/loader.ts` in 05-building-block-view.md
- `config/schema.ts` in 05-building-block-view.md

## Sources
- AgentContract Specification — YAML-Format: https://github.com/agentcontract/spec/blob/main/SPEC.md
- js-yaml Bibliothek: https://github.com/nodeca/js-yaml
- Zod Bibliothek: https://zod.dev/
- KIROS /steering: Referenzkonzept für runtime steering files
- opencode Config (JSONC): https://opencode.ai/docs/config
