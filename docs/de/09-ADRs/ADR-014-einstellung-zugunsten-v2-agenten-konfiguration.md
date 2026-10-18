# ADR-014: Einstellung des Plugins zugunsten der OpenCode-V2-Agenten-Konfiguration

## Status

Accepted (2026-10-18). Ersetzt die Laufzeit-Durchsetzung aus ADR-001, ADR-002 und ADR-010.

## Context

Der Katalog [awesome-opencode #514](https://github.com/Heretek-AI/awesome-opencode/issues/514) entfernt V1-only-Plugins am 2027-01-01. Das Plugin hängt von `@opencode-ai/plugin` 1.x ab und exportiert die V1-Funktions-API (ADR-010). Eine Migration auf `@opencode/plugin` 2.x bedeutet einen Neubau aller Hooks (`execute.before`, Prompt-Hook, Tools mit Effect-Schema statt zod).

Vor dem Neubau wurde geprüft, was OpenCode V2 selbst kann (Quellen: `@opencode/schema@2.0.32`, `anomalyco/opencode` Tag `v2.0.32`):

- **Agenten-Konfiguration** (`config/agent.d.ts`): `system`, `permissions` (`allow`/`deny`/`ask`), `steps`, `mode`, `model`; global `instructions`, `skills`, `policies`.
- **Schritt-Begrenzung** (`packages/core/src/session/runner/llm.ts`):
  - `const stepLimitReached = loaded.agent.info.steps !== undefined && step >= loaded.agent.info.steps`
  - `toolChoice: stepLimitReached ? "none" : undefined` – Tools werden beim Provider gesperrt, nicht nur per Prompt.
  - `if (promoted > 0) step = 1` – nur eine neue Nutzereingabe setzt den Zähler zurück.
  - `MAX_STEPS_PROMPT`: „Tools are disabled until next user input. Respond with text only.“

Zusätzlich offen: Das Tool `anchor-bypass` erlaubte der KI, die Schritt-Bestätigung zu umgehen (`docs/issues/step-confirmation-bypass.md`). Vorgabe: kein Bypass, strukturell.

## Alternatives Considered

- **A – Migration als ein V2-Plugin** (Baseline): gleicher Funktionsumfang, neue API.
- **B – Aufteilung in zwei V2-Plugins** (`step-confirmation` + `semantic-anchors`), ohne Bypass.
- **C – Plugin einstellen, Ersatz durch V2-Agenten-Konfiguration**: Anker als `system`/`instructions`/`skills`, Rollen/Profile als Agenten, Tool-Sperren über `permissions`, Schritt-Bestätigung über `steps` + `system`-Regel + `permissions: ask`.

### Pugh-Matrix (Baseline A = 0)

| Kriterium | A | B | C |
|---|---|---|---|
| Durchsetzung Schritt-Bestätigung (nicht umgehbar) | 0 | + | + |
| Bypass strukturell ausgeschlossen | 0 | + | + |
| Wartungsaufwand (API-Wechsel, Effect-Peer-Dependency) | 0 | − | + |
| Abdeckung WARN-Modus / Inhaltsprüfung von Nachrichten | 0 | 0 | − |
| Nutzen für den Autor (opencode zuletzt genutzt 2026-09-06) | 0 | 0 | + |
| **Summe** | 0 | +1 | +3 |

## Decision

Option C. Das Plugin wird nicht migriert und eingestellt:

- npm: `opencode-semantic-anchors@0.1.0` als deprecated markiert (2026-10-18).
- Ersatz: V2-Agenten mit `steps` (harte Obergrenze), `system`-Regel „nach jedem logischen Schritt anhalten“ und `permissions` (`ask` für kritische Aktionen, `deny` für Verbotenes).
- Semantische Anker bleiben Vokabular und werden als Text eingebunden (`system`, `instructions`, `skills`), wie im Claude-Code-Setup über `CLAUDE.md`.

## Consequences

**Positiv**

- Schritt-Bestätigung ohne Bypass, durchgesetzt durch OpenCode selbst (`toolChoice: "none"`).
- Kein eigener Code mehr zu pflegen; keine Abhängigkeit von Plugin-API-Wechseln.
- Das offene Bypass-Issue entfällt.

**Negativ**

- WARN-Modus und Inhaltsprüfung von Nachrichten (z. B. Source-Anchor) entfallen. Beide waren reine Textmuster-Prüfungen.
- `steps` zählt Modell-Aufrufe, keine logischen Schritte. Ein logischer Schritt bleibt eine Anweisung im `system`-Prompt; `steps` ist die harte Obergrenze dahinter.
- Der Katalogeintrag in awesome-opencode entfällt (spätestens 2027-01-01).

**Offen**

- Praktischer Test von `steps` mit OpenCode V2 (bisher nur Quellcode-Analyse).
