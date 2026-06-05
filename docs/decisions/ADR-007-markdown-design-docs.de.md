# ADR-007: Markdown für Design-Doku, .adoc erst bei Contribution

## Status
Accepted

## Context
Das LLM-Coding/Semantic-Anchors Repository schreibt **AsciiDoc (`.adoc`)** als verbindliches Format vor:

> "AsciiDoc is mandatory — Do not convert to Markdown"
> — *CLAUDE.md, LLM-Coding/Semantic-Anchors Repository*

Unser Plugin wird als Contribution in dieses Repository eingebracht. Gleichzeitig entwickeln wir das Design-Dokument im arc42-Format lokal.

Die Frage: Sollen wir die Design-Doku von Anfang an in AsciiDoc schreiben (kompatibel zum Contribution-Ziel), oder in Markdown (effizienter für die lokale Entwicklung) und erst bei Contribution konvertieren?

## Alternatives Considered

### Option A: AsciiDoc von Anfang an
Das gesamte Design-Dokument wird direkt in `.adoc` geschrieben.

**Vorteile:**
- Keine Konvertierung bei Contribution nötig
- 1:1 kompatibel mit Semantic-Anchors-Repo
- Kein "Verlust" durch Format-Übersetzung
- Frühe Gewöhnung an AsciiDoc-Syntax

**Nachteile:**
- **Höhere kognitive Last** — AsciiDoc ist weniger bekannt als Markdown
- **Weniger Tool-Unterstützung** — kein nativer Support in vielen Editoren/Viewern
- **arc42-Tooling** ist auf Markdown ausgelegt, nicht auf AsciiDoc
- AsciiDoc-Compiler (`asciidoctor`) muss lokal installiert sein
- Preview/IDE-Unterstützung für AsciiDoc ist schlechter als für Markdown
- **Schlechtere Diff-Lesbarkeit** — AsciiDoc hat mehr syntaktisches Rauschen

### Option B: Markdown für Design-Doku, .adoc bei Contribution (gewählt)
Das Design-Dokument wird lokal in `.md` geschrieben. Erst bei der Contribution ins Semantic-Anchors-Repo wird es nach `.adoc` konvertiert.

**Vorteile:**
- **Geringere kognitive Last** während der Design-Phase
- **Bessere Diff-Lesbarkeit** — Markdown ist schlanker
- Hervorragende Tool-Unterstützung (Preview, Linting, Editoren)
- arc42 ist nativ Markdown-kompatibel
- Kein zusätzlicher Compiler nötig
- Schnellere Iterationen in der Design-Phase

**Nachteile:**
- **Konvertierungsaufwand** bei Contribution (einmalig, aber nicht null)
- Manuelle Nacharbeit bei der Konvertierung (nicht alle Markdown-Features haben 1:1-Entsprechung in AsciiDoc)
- Risiko, dass bei der Konvertierung Inhalte verloren gehen
- Zwei Formate = zwei Versionen (müssen synchron bleiben)

### Option C: Markdown mit AsciiDoc-kompatiblen Subset
In Markdown schreiben, aber nur Features nutzen, die 1:1 in AsciiDoc abbildbar sind.

**Nachteile:**
- **Schränkt Markdown-Nutzung ein** — kein Tables, kein Mermaid, kein strikter Markdown-Standard
- Schwer durchsetzbar (kein Linter prüft "AsciiDoc-kompatibles Markdown")
- Erhöht die kognitive Last (muss ständig ans Zielformat denken)
- Konvertierung trotzdem nötig — Aufwand bleibt

## Evaluation Criteria
| Kriterium | Gewicht | Beschreibung |
|-----------|---------|--------------|
| Entwicklungsgeschwindigkeit | Hoch | Design-Phase soll nicht durch Format-Wahl verlangsamt werden |
| Diff-Lesbarkeit | Hoch | Code-Reviews und Änderungsnachverfolgung |
| Contribution-Readiness | Mittel | Muss am Ende ins Semantic-Anchors-Repo (.adoc) |
| Tool-Unterstützung | Mittel | IDE-Preview, Linting, arc42-Templates |
| Konvertierungsaufwand | Niedrig | Einmaliger Aufwand bei Contribution |

## Decision
**Option B: Markdown für Design-Doku, .adoc erst bei Contribution** wurde gewählt.

Begründung:
- Design-Phase profitiert von Markdowns Schlichtheit und Tool-Unterstützung
- Der einmalige Konvertierungsaufwand bei Contribution ist akzeptabel
- Eine lokale `opencode-semantic-anchors-design.adoc` wird parallel als "Master-Kopie" im .adoc-Format geführt (bereits vorhanden) — bei Contribution muss nur diese aufgeräumt werden
- Das Semantic-Anchors-Repo verlangt AsciiDoc, aber erst bei Einreichung

## Consequences
- **Positiv:** Schnellere Design-Phase durch vertrautes Markdown
- **Positiv:** arc42-Tooling funktioniert nativ mit Markdown
- **Positiv:** Bessere Diff-Lesbarkeit bei Code-Reviews
- **Negativ:** Konvertierungsaufwand vor Contribution (ca. 1-2h für das gesamte Dokument)
- **Negativ:** Zwei parallele Formate bis zur Contribution (müssen synchron bleiben)
- **Negativ:** Mermaid-Diagramme müssen ggf. in PlantUML konvertiert werden (AsciiDoc-Standard)
- **Trade-off:** Kurzfristig mehr Effizienz, langfristig einmaliger Konvertierungsaufwand

## Related
- Entscheidung 6 in 04-solution-strategy.md
- 02-architecture-constraints.md (Process Constraints)
- `docs/opencode-semantic-anchors-design.adoc` (parallele .adoc-Version)
- ADR-012: Bilingual Documentation (Sprache ist separates Concern von Format — Sprachsuffix `.de.md` und `.de.adoc` unabhängig von Format-Wahl)

## Sources
- LLM-Coding/Semantic-Anchors — CLAUDE.md: "AsciiDoc is mandatory — Do not convert to Markdown." https://github.com/LLM-Coding/Semantic-Anchors/blob/main/CLAUDE.md
- arc42 Template (Markdown): https://github.com/arc42/arc42-template
- AsciiDoc Specification: https://asciidoc.org/
