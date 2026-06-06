# 6. Laufzeitsicht

## Startsequenz

```mermaid
sequenceDiagram
  participant FS as Dateisystem
  participant OC as opencode
  participant Plugin as opencode-semantic-anchors
  participant Engine as RuleEngine
  participant Config as ConfigLoader

  OC->>Plugin: load plugin (opencode.jsonc)
  Plugin->>Config: load(opencode-semantic-anchors.yaml)
  Config->>FS: read YAML file
  FS-->>Config: raw YAML
  Config->>Config: validate against Zod schema
  alt Config valid
    Config-->>Plugin: LoadedConfig { contracts, presets, settings }
    Plugin->>Engine: new RuleEngine(config)
    Engine-->>Plugin: ready
    Plugin-->>OC: Plugin loaded
  else Config invalid
    Config-->>Plugin: ValidationError
    Plugin-->>OC: Plugin loaded with defaults + warning
  end

  OC->>Plugin: agent.activate({ role: "software-developer" })
  Plugin->>Engine: setRole("software-developer")
  Engine->>Config: getActiveContracts("software-developer")
  Config-->>Engine: [contract-A, contract-B, ...]
  Engine-->>Plugin: SessionState { role, toolCallCount: 0 }
  Plugin-->>OC: ready
```

## Tool-Ausführung: Blocked Path

Tritt ein, wenn ein aktiver Contract einen BLOCK auslöst (z. B. Step Confirmation nach 3 Tool-Aufrufen ohne "Weiter?"):

```mermaid
sequenceDiagram
  participant User
  participant OC as opencode
  participant Plugin as opencode-semantic-anchors
  participant Engine as RuleEngine

  Note over User,Engine: Tool-Call #3 ohne vorheriges "Weiter?"
  User->>OC: "edit file src/main.ts"
  OC->>Plugin: tool.execute.before(edit, { file: "src/main.ts" })
  Plugin->>Engine: evaluate({ type: "tool", toolName: "edit" })
  Engine->>Engine: toolCallCount = 3, interval = 3, no confirmation
  Engine-->>Plugin: Entscheidung { allow: false, contract: { id: "step-confirmation" } }
  Plugin->>Plugin: throw new Error("🚫 Step Confirmation: ...")
  Plugin--xOC: Error: block message
  OC->>User: Show block message
  User->>OC: "/anchor bypass 'continuing intentional edit'"
  OC->>Plugin: anchor-bypass.execute({ reason: "continuing intentional edit" })
  Plugin->>Engine: incrementOverride()
  Engine-->>Plugin: overrideCount: 1/3
  Plugin-->>OC: "Override 1/3: ..."
  OC->>Plugin: tool.execute.before(edit, ...) [retry by LLM]
  Plugin->>Engine: evaluate({ type: "tool", toolName: "edit" })
  Engine-->>Plugin: Entscheidung { allow: true }
  Plugin-->>OC: proceed
  OC->>User: Execute edit
```

## Tool-Ausführung: Warn-Pfad

Tritt ein, wenn ein Contract im WARN-Mode matcht (z. B. Source Anchor bei `write` ohne vorherige Quellenangabe):

```mermaid
sequenceDiagram
  participant User
  participant OC as opencode
  participant Plugin as opencode-semantic-anchors
  participant Engine as RuleEngine

  User->>OC: "write the implementation"
  OC->>Plugin: tool.execute.before(write, { file: "..." })
  Plugin->>Engine: evaluate({ type: "tool", toolName: "write" })
  Engine->>Engine: check message history for source citation
  Engine-->>Plugin: Entscheidung { allow: true, contract: { id: "source-anchor-warn" } }
  Plugin->>Plugin: client.app.log({ level: "warn", message: "⚠️ Source Anchor: ..." })
  Plugin-->>OC: proceed (no throw)
  OC->>User: Execute write + [warning in log]
```

## Chat-Nachrichtenfluss

Kein Blocking, nur Hinweise:

```mermaid
sequenceDiagram
  participant User
  participant OC as opencode
  participant Plugin as opencode-semantic-anchors
  participant Engine as RuleEngine

  User->>OC: "refactor this module"
  OC->>Plugin: event({ type: "message.updated", content: "refactor this module" })
  Plugin->>Engine: evaluate({ type: "message", content: "refactor this module" })
  Engine->>Engine: check Intent (missing: what? why? verify?)
  Engine-->>Plugin: Entscheidung { allow: true, message: "No explicit intent detected" }
  Plugin->>Plugin: client.app.log({ level: "info", message: "Tip: ..." })
  Plugin-->>OC: proceed
  OC->>User: Process message (suggestion in log)
```

## Agenten-Rollenwechsel

```mermaid
sequenceDiagram
  participant OC as opencode
  participant Plugin as opencode-semantic-anchors
  participant Engine as RuleEngine
  participant Config as ConfigLoader

  OC->>Plugin: agent.activate({ role: "software-architect" })
  Plugin->>Engine: setRole("software-architect")
  Engine->>Config: getActiveContracts("software-architect")
  Config-->>Engine: [boundary-anchor, emergence-anchor, step-confirmation]
  Engine->>Engine: Reset toolCallCount
  Engine-->>Plugin: SessionState { role: "software-architect" }
  Plugin-->>OC: ready
  OC->>Plugin: agent.activate({ role: "software-developer" })
  Plugin->>Engine: setRole("software-developer")
  Engine->>Config: getActiveContracts("software-developer")
  Config-->>Engine: [step-confirmation, source-anchor, intent-anchor]
  Engine->>Engine: Reset toolCallCount
  Engine-->>Plugin: SessionState { role: "software-developer" }
  Plugin-->>OC: ready
```

## Fehlerszenarien

### Config-Validierungsfehler

```mermaid
sequenceDiagram
  participant FS as Dateisystem
  participant Plugin as opencode-semantic-anchors
  participant Config as ConfigLoader

  Plugin->>Config: load("opencode-semantic-anchors.yaml")
  Config->>FS: read
  FS-->>Config: invalid YAML
  Config->>Config: log Warning
  Config-->>Plugin: DefaultConfig (built-in fallback)
  Plugin->>Plugin: continue with defaults
```

### Hook-Fehlerwurf

```mermaid
sequenceDiagram
  participant OC as opencode
  participant Plugin as opencode-semantic-anchors
  participant Engine as RuleEngine

  OC->>Plugin: tool.execute.before(edit, ...)
  Plugin->>Engine: evaluate(...)
  Engine--xPlugin: throws Error
  Plugin->>Plugin: catch Error, log, do NOT re-throw
  Plugin-->>OC: proceed (tool executes)
```

> **Fail-Open-Prinzip:** Bei jedem Fehler in einem Hook gibt das Plugin `{ allow: true }` zurück, damit der Agent nicht blockiert wird. Der Fehler wird geloggt. Dieses Verhalten ist in `05-building-block-view.md` Abschnitt "Error Handling" spezifiziert (vier Szenarien: Config/RuleEngine/Hook/Tool).

## Override-Maximum erreicht

```mermaid
sequenceDiagram
  participant User
  participant Plugin as opencode-semantic-anchors
  participant Engine as RuleEngine

  User->>Plugin: "/anchor bypass 'one more time'"
  Plugin->>Engine: getState()
  Engine-->>Plugin: SessionState { overrideCount: 3, maxOverrides: 3 }
  Plugin-->>User: "Error: Max overrides (3) reached. Cannot bypass."
```

## Session-Reset (Plugin-Neuladung)

Bei Plugin-Neuladung (z. B. nach Config-Änderung + `/anchor config-reload`):

1. ConfigLoader liest YAML erneut
2. Validiert gegen Zod-Schema
3. RuleEngine wird mit neuer Config initialisiert
4. SessionState wird zurückgesetzt (toolCallCount = 0, overrideCount = 0)
5. Rolle bleibt erhalten (sofern gesetzt)
