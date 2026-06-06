# 3. Systemkontext und -abgrenzung

## Systemgrenze

### Im Umfang (Plugin)

Das Plugin `opencode-semantic-anchors` umfasst:

- **Contract Enforcement über Hooks**: Abfängt `tool.execute.before`, `chat.message`, `agent.activate`
- **Regel-Engine**: Wertet eingehende Ereignisse gegen aktive Structural-Coupling-Contracts aus
- **Override-Mechanismus**: `/anchor bypass`, `/anchor status`, `/anchor config-reload`
- **Konfigurationsladung**: Liest `opencode-semantic-anchors.yaml` mit Vertragsdefinitionen
- **Session State**: Verfolgt Tool-Aufrufzahlen, Override-Zähler, aktive Rolle
- **Eigenständige Steuerungsregeln**: Contracts ohne `anchorRefs` — generische Regeln (z. B. "BLUF", "MECE", Spracheinschränkungen) funktionieren identisch zu Anchor-basierten Contracts

### Nicht im Umfang (Plugin macht NICHT)

| Nicht im Umfang | Zuständig |
|----------------|-----------|
| Anchor-Erkennungsauswertung | LLM-Coding/Semantic-Anchors Bewertungsframework (Issue #329) |
| Vertragserstellung / Template-Rendering | LLM-Coding/Semantic-Anchors `contracts.json` + Website |
| Anchor-Katalog durchsuchen | LLM-Coding/Semantic-Anchors Website |
| CI/CD-Entscheidungsgatter | `agentcontract/spec` CI-Gatter oder benutzerdefinierter Workflow |
| Multi-Agent-Vertragssynchronisation | Semantic-Anchors Onboarding-Skill (Issue #521) |

> **Take before Buy before Make:** Das Plugin vermeidet absichtlich die Duplikation dieser vorhandenen Lösungen. Es konzentriert sich auf die opencode-spezifische Lücke — Runtime Contract Enforcement über Plugin-Hooks — die kein bestehendes Projekt abdeckt. Wo möglich, orientiert es sich an der Terminologie von `agentcontract/spec` (z. B. YAML-basierte Verträge, BLOCK/WARN-Modi).

## Fachlicher Kontext

```mermaid
C4Context
  Person(user, "User", "Developer or team lead configuring contracts")
  System(opencode, "opencode", "Agent runtime with plugin hooks")
  System_Ext(anchorRepo, "LLM-Coding/Semantic-Anchors", "Anchor catalog + contract definitions")
  System_Ext(agentContract, "agentcontract/spec", "Contract specification standard")
  System_Ext(kiros, "Kiros", "Has /steering files (reference concept)")

  System_Boundary(plugin, "opencode-semantic-anchors") {
    Component(hooks, "Hook Handlers", "tool.execute.before, chat.message, agent.activate")
    Component(engine, "Rule Engine", "Evaluates contracts → verdict")
    Component(config, "Config Loader", "Reads YAML contract definitions")
    Component(tools, "Custom Tools", "/anchor bypass, status, config-reload")
  }

  Rel(user, opencode, "Uses")
  Rel(opencode, plugin, "Loads")
  Rel(plugin, anchorRepo, "References terms from", "design-time")
  Rel(plugin, agentContract, "Aligns schema with", "design-time")
  Rel(kiros, plugin, "Inspiration for", "steering mechanism")
```

## Technischer Kontext

### Schnittstellen

| Schnittstelle | Richtung | Daten | Protokoll |
|---------------|----------|-------|-----------|
| `tool.execute.before` | opencode → plugin | `{ toolName, args, caller }` → `{ allow, message, overrideTool? }` | opencode Plugin-SDK |
| `chat.message` | opencode → plugin | `{ content, conversationContext }` → `{ suggestions[] }` | opencode Plugin-SDK |
| `agent.activate` | opencode → plugin | `{ agentConfig }` → `{ state }` | opencode Plugin-SDK |
| Konfigurationsdatei | Dateisystem → plugin | `opencode-semantic-anchors.yaml` | YAML-Datei lesen |
| Benutzerdefinierte Tools | Benutzer → plugin | `/anchor bypass [reason]` | opencode Custom-Tool-API |

### Vorhandene Lösungen (Take before Buy before Make)

Vor dem Schreiben eigener Code geprüft:

| Lösung | Funktion | Warum allein nicht ausreichend |
|--------|----------|--------------------------------|
| `agentcontract/spec` | Vollständiges Vertragsspezifikation mit Vor-/Nachbedingungen, CI-Gattern | Keine opencode-Plugin-Hook-Implementierung; für CI-Gatter konzipiert, nicht für Agenten-Steuerung zur Laufzeit |
| `gl0bal01/contract-agents` | AGENTS_CONTRACT.md mit Agentenrollen | Nur Prompt-basiert, nicht Hook-durchgesetzt; kein opencode-Plugin |
| Kiros `/steering` | Laufzeit-Steuerungsdateien | Proprietär zu Kiros; opencode hat kein Äquivalent |
| Semantic-Anchors Onboarding-Skill | Installiert Anchor-Blöcke in AGENTS.md | Nur Prompt, keine Durchsetzung; Claude-Code-Plugin, nicht opencode |
| SpecAnchor | Drei-Stufen-Spezifikationssystem mit Abweichungserkennung | Nicht Hook-basiert; keine opencode-Integration |

**Entscheidung:** Das opencode-Plugin füllt eine echte Lücke — Runtime Contract Enforcement innerhalb des opencode-Plugin-Systems. Keine der vorhandenen Lösungen bietet dies. Eine Angleichung an die Terminologie von `agentcontract/spec` ist wünschenswert, um eine Fragmentierung des Ökosystems zu vermeiden.

### Position im Semantic-Anchors-Ökosystem

Das Repository LLM-Coding/Semantic-Anchors bietet bereits Integrationen für mehrere Coding-Agenten:

| Agent | Integration | Typ |
|-------|------------|-----|
| Claude Code | `plugins/semantic-anchors/` + Skills | Plugin + AGENTS.md |
| Codex | AGENTS.md | Projektkontext |
| Gemini CLI | GEMINI.md | Nativer Kontext |
| Cursor | `.cursor/rules/*.mdc` | Pfad-basierte Regeln |
| GitHub Copilot | `.github/copilot-instructions.md` | Repo-Anweisungen |
| Windsurf | AGENTS.md + Windsurf Rules | Projektkontext |
| **opencode** | **`opencode-semantic-anchors` (dieses Plugin)** | **Runtime Contract Enforcement über Hooks** |

Dieses Plugin ist der opencode-spezifische Beitrag zum Semantic-Anchors-Ökosystem. Es wird als `plugins/opencode-semantic-anchors/` in das Repository eingebracht und der opencode-Community zur Verfügung gestellt — analog zum bestehenden Claude-Code-Plugin unter `plugins/semantic-anchors/`.

> **Take before Buy before Make (angewandt):** Anstatt ein weiteres "Anchor-Block-in-AGENTS.md"-Werkzeug zu bauen (das bereits im Onboarding-Skill existiert), konzentriert sich dieses Plugin auf die Lücke, die keine bestehende Integration abdeckt: Runtime Contract Enforcement über Plugin-Hooks.
