# 1. Einführung und Ziele

## Anforderungsüberblick

### Die Lücke

opencode hat derzeit keinen eingebauten Steering-Mechanismus. Während Tools wie Kiros `/steering`-Dateien bereitstellen, die Verhaltensregeln zur Laufzeit durchsetzen, verlässt sich opencode ausschliesslich auf Prompt-Instruktionen — die von Agenten häufig ignoriert oder fehlinterpretiert werden. Das Repository [LLM-Coding/Semantic-Anchors](https://github.com/LLM-Coding/Semantic-Anchors) definiert zwei unterschiedliche Konzepte, um dies zu adressieren:

### Schlüsselunterscheidung: Anchor vs. Contract

**Semantic Anchor** (was der LLM bereits kann):
> *Semantic anchors* are well-defined terms, methodologies, and frameworks that serve as reference points when communicating with Large Language Models (LLMs). They act as shared vocabulary that triggers specific, contextually rich knowledge domains within an LLM's training data.
>
> — *docs/about.adoc, LLM-Coding/Semantic-Anchors*

**Semantic Contract** (was projektspezifisch durchgesetzt werden muss):
> Terms that don't qualify as semantic anchors can still be useful as Semantic Contracts. A contract defines what a term means in your project — either by composing established anchors or by providing custom definitions that only exist within your team.
>
> — *docs/rejected-proposals.adoc, LLM-Coding/Semantic-Anchors*

Die Evaluierung unterscheidet entsprechend:

| | Anchor Eval | Contract Eval |
|---|---|---|
| Tests | Recognition / knowledge | Compliance / behavior |
| Prompt | Direct question | Task with system context |
| Scoring | Does it know the term? | Does it follow the instruction? |
| System prompt | None | Contains the contract |

> — *Issue #370, LLM-Coding/Semantic-Anchors*

### Design-Prinzipien für dieses Plugin

**Source Anchor (wörtlich zitieren, nicht paraphrasieren):** Jede Behauptung im Design muss aus einer wörtlich zitierten Quelle belegbar sein. Keine Spekulation über Fehlerursachen oder Konzepte ohne Quellenangabe.

**Take before Buy before Make:** Bevor eigener Code geschrieben wird, muss geprüft werden, ob es eine existierende Lösung gibt – inklusive Fork/OpenSource. "Buy" umfasst auch die Integration bestehender Open-Source-Komponenten.

### Lösung

Das `opencode-semantic-anchors`-Plugin schliesst die Steering-Lücke. Es bietet einen **Runtime-Steering-Mechanismus** für opencode, der:

- Tool-Aufrufe und Chat-Nachrichten über Plugin-Hooks abfängt
- Agentenverhalten gegen konfigurierte **Structural Coupling Contracts** auswertet — Regeln, die Trigger-Bedingungen (Tool-Aufrufe, Nachrichten, Zustand) und Enforcement-Aktionen (BLOCK/WARN) definieren
- Contracts können optional auf [Semantic Anchors](https://github.com/LLM-Coding/Semantic-Anchors) als Wissensquelle verweisen, aber auch eigenständige Steering-Regeln sein (z.B. "immer auf Deutsch antworten", "MECE-Struktur verwenden", "BLUF-Format einhalten")
- Vor Verstössen **blockt** oder **warnt** — anstatt auf die Selbstdisziplin des Agenten zu vertrauen

Das Ergebnis ist deterministischeres Agentenverhalten, höhere Code-Qualität und klare, durchsetzbare Richtlinien, die die Varianz zwischen Sitzungen reduzieren.

## Qualitätsziele

| Priorität | Ziel | Beschreibung |
|-----------|------|-------------|
| 1 | **Steering Correctness** | Jede konfigurierte Steering-Regel muss durchgesetzt werden (BLOCK-Modus), wenn ihre Trigger-Bedingung erfüllt ist. Kein stillschweigendes Ignorieren. |
| 2 | **Reliability** | LLM-Antworten müssen vorhersagbarer, reproduzierbarer und nachvollziehbarer werden. Gleiche Steering-Konfiguration muss gleiches Agentenverhalten über Sitzungen hinweg erzeugen (**Determinismus**). Session-Replay mit identischem Input muss identischen Output erzeugen (**Reproduzierbarkeit**). Block/Warn-Entscheidungen müssen aus Logs erklärbar sein (**Nachvollziehbarkeit**). Agentenverhalten muss konsistent sein, nicht überraschend (**Vorhersagbarkeit**). Varianz durch reine Prompt-Steuerung reduzieren. |
| 3 | **Workflow Continuity** | Hook-Prüfungen in <50ms abschliessen. Steering darf die Agenten-UX nicht unnötig blockieren. Bypass-Mechanismus verhindert Deadlocks. |
| 4 | **Configuration Clarity** | Steering-Regeln werden in einfachem YAML definiert. Rollenbasierte Presets decken 90% der Anwendungsfälle ab. |
| 5 | **Composability** | Koexistiert mit anderen opencode-Plugins und bestehenden Prompt-Instruktionen. Kein gemeinsamer veränderlicher Zustand. |
| 6 | **Context Efficiency** | Steering-Regeln dürfen KEINE LLM-Context-Tokens verbrauchen. Die gesamte Durchsetzung muss über Plugin-Hooks erfolgen, nicht über System-Prompt-Instruktionen. Das Plugin darf nicht zu "Instruction Gluttony" beitragen oder mit dem Task-Context konkurrieren. |
| 7 | **Reversibility** | Jeder Block muss rückgängig machbar sein – der Benutzer benötigt einen Escape-Hatch (z. B. `/anchor bypass` oder einen konfigurierbaren Override). Kein permanenter Lockout. |

## Stakeholder

| Rolle | Anchor Role ID | Anliegen |
|-------|----------------|----------|
| Softwareentwickler / Engineer | `software-developer` | Profitiert direkt von der Durchsetzung der Intent-, Source-, Verification- und Step-Confirmation-Anchors während Coding-Sitzungen |
| Consultant / Coach | `consultant` | Möchte das Plugin nutzen, um Teams die Anchor-Methodik ohne manuelle Überwachung zu vermitteln |
| Softwarearchitekt | `software-architect` | Benötigt architekturelle Anchors (Boundary, Emergence), die in Design-Sitzungen durchgesetzt werden |
| Teamleiter / Engineering Manager | `team-lead` | Möchte teamweite Konsistenz und messbare Anchor-Compliance |
| **Compliance / Governance Officer** | — | Benötigt durchsetzbare Regeln (keine "weichen Vorschläge") und ein Audit-Log über Verstösse und Bypasses |
| **Ethics Reviewer** | — | Benötigt Ethical-Anchor-Enforcement — das Plugin muss ethische Implikationen verifizierbar machen |
| **Datenschutzbeauftragter** | — | Benötigt die Zusicherung, dass keine Geheimnisse oder personenbezogenen Daten durch Tool-Aufrufe oder Logs preisgegeben werden |
| **C-Level / Entscheider** | — | Benötigt Metriken: "Wird die Methode befolgt?" — ohne das Tool selbst nutzen zu müssen |
| **Betriebsrat** | — | Muss vor dem Deployment zustimmen. Das Plugin darf nicht zur Leistungsüberwachung oder Disziplinierung verwendet werden. Bypass-Logs müssen DSGVO-konform sein. |

> **Hinweis:** Die Compliance-, Ethics-, Data-Privacy-, C-Level- und Betriebsrat-Stakeholder sitzen *ausserhalb der direkten Entwicklerkette*. Sie sind nicht in der Berichtslinie und konfigurieren das Plugin nicht selbst. Sie benötigen:
> - **Audit-Logs**, die über Sitzungen hinweg aggregiert sind (nicht nur CLI-Output)
> - **Policy-Review** vor dem Deployment (Zustimmung des Betriebsrats)
> - **Dashboards oder Reports** — keine CLI-Tools
> - **Anonymisierte Metriken**, um Einzelpersonen nicht herauszugreifen (DSGVO-Anforderung)
