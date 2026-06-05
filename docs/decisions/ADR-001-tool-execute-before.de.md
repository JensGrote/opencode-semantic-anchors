# ADR-001: Enforcement via `tool.execute.before` statt `permission.ask`

## Status
Accepted

## Context
Das opencode Plugin SDK bietet zwei Hooks, um Tool-Ausführungen zu beeinflussen:

1. **`permission.ask`** — Wird vor jeder Tool-Ausführung aufgerufen. Kann die Ausführung erlauben oder blocken. Der User sieht einen Permission-Dialog.
2. **`tool.execute.before`** — Wird ebenfalls vor jeder Tool-Ausführung aufgerufen. Kann `throw new Error()` zum Blocken nutzen, oder den Durchlauf erlauben.

Unser Plugin braucht einen zuverlässigen Mechanismus, um:
- Tool-Calls bei Step-Confirmation-Verstoss zu blocken
- Warnungen bei Source-Anchor-Verstössen auszugeben
- Einen Bypass-Mechanismus anzubieten (`/anchor bypass`)

Der Mechanismus muss stabil und verlässlich sein, da das Plugin sonst "silent ignore" riskiert.

## Alternatives Considered

### Option A: `permission.ask` Hook
Der `permission.ask` Hook wird von opencode aufgerufen, wenn ein Tool eine bestimmte Permission benötigt. Das Plugin könnte hier blocken.

**Vorteile:**
- Nativ für Permission-Checks designed
- User sieht einen Permission-Dialog

**Nachteile:**
- **Instabil in current opencode** — Regression Issues #7006 und #28066
- Permission-Dialog ist nicht unser UX-Modell (wir wollen BLOCK+overrideTool, nicht Permission-Grant)
- opencode-Entwicklung hat `permission.ask` wiederholt kaputt gemacht (Regressionen)

### Option B: `tool.execute.before` Hook
Der `tool.execute.before` Hook feuert vor jedem Tool-Call. Das Plugin kann via `throw new Error()` blocken.

**Vorteile:**
- **Stabil** — keine bekannten Regressionen
- Throw wird von opencode sauber gefangen und als Fehlermeldung angezeigt
- Erlaubt eigene Logik (Bypass-Prüfung, Warn-Logging) vor dem Throw
- Erlaubt Custom Tool `anchor-bypass` als separaten Mechanismus

**Nachteile:**
- `throw new Error()` ist ein "harter" Block — es gibt keinen "soft block with override option" im SDK
- Warnungen (allow + message) müssen via `client.app.log()` erfolgen, nicht via return-Wert
- Keine native Unterstützung für `overrideTool` (muss via Custom Tool gelöst werden)

### Option C: Kombination (beide Hooks)
Für verschiedene Zwecke beide Hooks nutzen.

**Nachteile:**
- Doppelte Komplexität
- `permission.ask` ist instabil — würde uns zwingen, ständig nachzuziehen
- Zwei Hooks = zwei Fehlerquellen

## Evaluation Criteria
| Kriterium | Gewicht | Beschreibung |
|-----------|---------|--------------|
| Stabilität | Hoch | Der Hook muss in opencode über Releases stabil bleiben |
| Block-Fähigkeit | Hoch | Muss Verstösse zuverlässig blocken können |
| Warn-Fähigkeit | Mittel | Soll Warnungen ausgeben können |
| Bypass-Mechanismus | Mittel | User muss Block überwinden können |
| Einfachheit | Niedrig | Ein Hook ist besser als zwei |

## Decision
**Option B: `tool.execute.before`** wurde gewählt.

Begründung:
- Stabilität geht vor UX-Komfort (`permission.ask` ist unzuverlässig)
- `throw new Error()` blockt zuverlässig und wird von opencode sauber dargestellt
- Custom Tool `anchor-bypass` ersetzt den `overrideTool`-Mechanismus
- Warnungen werden via `client.app.log()` realisiert
- Ein Hook = geringere Fehleranfälligkeit

## Consequences
- **Positiv:** Stabiler Block-Mechanismus, unabhängig von opencode-Regressionen im Permission-System
- **Positiv:** Klare Trennung: BLOCK = throw, WARN = log
- **Negativ:** Kein `overrideTool`-Konzept im SDK — Bypass muss komplett eigenständig implementiert werden
- **Negativ:** Warnungen erscheinen nur im Log, nicht als UI-Message (UX-Verlust gegenüber einem hypothetischen `allow + message`)
- **Negativ:** Bei einer zukünftigen Stabilisierung von `permission.ask` könnte ein Migration auf das native System attraktiv werden
- **Abhängigkeit:** ADR-010 (Funktionsbasierte Plugin-API) beschreibt den konkreten Migrationspfad, falls `permission.ask` stabil wird — siehe "Abhängigkeit zu ADR-001" in ADR-010

## Related
- Entscheidung 1 in 04-solution-strategy.md
- 02-architecture-constraints.md (Technical Constraints)
- ADR-002: Structural Coupling Contract statt direkter Anchor-Enforcement
- ADR-010: Funktionsbasierte Plugin-API (Future Migration Path bei stabilem permission.ask)

## Sources
- opencode GitHub Issue #7006: https://github.com/opencode-ai/opencode/issues/7006
- opencode GitHub Issue #28066: https://github.com/opencode-ai/opencode/issues/28066
- opencode Plugin SDK — Events: https://opencode.ai/docs/plugins#events
- opencode Plugin SDK — .env protection example: https://opencode.ai/docs/plugins#env-protection
