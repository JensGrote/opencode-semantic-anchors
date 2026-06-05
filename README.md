# opencode-semantic-anchors

**Runtime steering plugin for [opencode](https://github.com/opencode-ai/opencode) — enforces Semantic Anchors, contracts, and step confirmations via plugin hooks.**

[![npm version](https://img.shields.io/npm/v/opencode-semantic-anchors)](https://www.npmjs.com/package/opencode-semantic-anchors)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](LICENSE)
[![GitHub](https://img.shields.io/badge/github-JensGrote/opencode--semantic--anchors-181717?logo=github)](https://github.com/JensGrote/opencode-semantic-anchors)

---

## 🇬🇧 English

### What is it?

`opencode-semantic-anchors` is a plugin for the opencode AI coding agent that enforces **behavioral contracts** at runtime. It implements the [Semantic Anchors](https://github.com/LLM-Coding/Semantic-Anchors) methodology — a set of rules that keep AI agents focused, traceable, and safe.

The plugin monitors:
- **Chat messages** — checks every message against configured rules
- **Tool execution** — validates tool calls before they run
- **Step confirmation** — enforces step-by-step approval with configurable intervals

### Features

- **📋 Contract System** — Define contracts that `BLOCK` or `WARN` on specific patterns
- **🧩 Profile System** — Built-in profiles (`socratic`, `architecture`) with role-based presets
- **🔍 Source Anchor Enforcement** — Require URL-verifiable sources for claims (with `requireSource`)
- **⏭️ Override Mechanism** — Emergency bypass with configurable maximum (default: 3 per session)
- **🛑 Step Confirmation** — Automatic pause every N steps (configurable interval)
- **🔧 Three Built-in Tools** — `anchor-bypass`, `anchor-status`, `anchor-config-reload`
- **🔄 Dynamic Role Switching** — Contracts re-resolve on `setRole()` via `ContractResolver`
- **📦 Zod-Validated Config** — Type-safe YAML configuration with full schema validation

### Installation

```bash
npm install opencode-semantic-anchors
```

Then add it to your `opencode.jsonc`:

```jsonc
{
  "plugin": "opencode-semantic-anchors",
  "config": "path/to/opencode-semantic-anchors.yaml"
}
```

### Quick Start

Create a config file `opencode-semantic-anchors.yaml`:

```yaml
version: "1"
profiles:
  - socratic
contracts:
  - id: custom-rule
    mode: WARN
    description: "Agent must always cite its sources"
    triggers:
      - type: message
        pattern: "*"
        requireSource: true
    maxOverrides: 3
```

### Built-in Profiles

| Profile | Description | Anchors |
|---------|-------------|---------|
| `socratic` | Basic source verification | Source Anchor, Intent Anchor, Verification Anchor |
| `architecture` | Architecture decisions (⚠️ requires separate PR) | ADR format, Boundary Anchor, Stakeholder Anchor |

Profiles can be combined. Use `roleProfiles` to assign profiles per role:

```yaml
roleProfiles:
  developer: ["socratic"]
  architect: ["socratic", "architecture"]
```

### Contracts

A contract defines what the agent must (or must not) do:

| Field | Description |
|-------|-------------|
| `id` | Unique identifier |
| `mode` | `BLOCK` (hard stop) or `WARN` (soft reminder) |
| `description` | What the contract enforces |
| `triggers` | Patterns that activate the contract |
| `maxOverrides` | How many bypasses allowed per contract |

### Tools

The plugin registers three tools in opencode:

| Tool | Description |
|------|-------------|
| `anchor-bypass` | Temporarily bypass a blocked contract |
| `anchor-status` | Show active contracts, counters, and current role |
| `anchor-config-reload` | Reload configuration without restart |

### Step Confirmation

Every N tool calls (default: 3), the plugin pauses and asks for confirmation before proceeding. Set `settings.stepConfirmationInterval` to adjust.

### Override Mechanism

When a contract blocks an action, the agent can request a one-time override via `anchor-bypass`. The override counter resets when contracts are reloaded. Maximum overrides per contract is configurable (default: 3).

---

## 🇩🇪 Deutsch

### Was ist das?

`opencode-semantic-anchors` ist ein Plugin für den opencode KI-Coding-Agenten, das **Verhaltensverträge (Contracts)** zur Laufzeit durchsetzt. Es implementiert die [Semantic Anchors](https://github.com/LLM-Coding/Semantic-Anchors) Methodik — ein Regelwerk, das KI-Agenten fokussiert, nachvollziehbar und sicher hält.

Das Plugin überwacht:
- **Chat-Nachrichten** — prüft jede Nachricht gegen konfigurierte Regeln
- **Tool-Ausführung** — validiert Tool-Aufrufe bevor sie ausgeführt werden
- **Schritt-Bestätigung** — erzwingt schrittweise Freigabe mit konfigurierbaren Intervallen

### Funktionen

- **📋 Vertragssystem** — Definiere Contracts, die bestimmte Muster `BLOCKieren` oder `WARNen`
- **🧩 Profilsystem** — Vorgefertigte Profile (`socratic`, `architecture`) mit rollenbasierten Presets
- **🔍 Source Anchor Enforcement** — Erzwinge URL-überprüfbare Quellenangaben (mit `requireSource`)
- **⏭️ Override-Mechanismus** — Notfall-Bypass mit konfigurierbarem Maximum (Standard: 3 pro Session)
- **🛑 Schritt-Bestätigung** — Automatische Pause alle N Schritte (konfigurierbares Intervall)
- **🔧 Drei Built-in-Tools** — `anchor-bypass`, `anchor-status`, `anchor-config-reload`
- **🔄 Dynamischer Rollenwechsel** — Contracts werden bei `setRole()` via `ContractResolver` neu aufgelöst
- **📦 Zod-validierte Config** — Typsichere YAML-Konfiguration mit vollständiger Schema-Validierung

### Installation

```bash
npm install opencode-semantic-anchors
```

Danach in der `opencode.jsonc` einbinden:

```jsonc
{
  "plugin": "opencode-semantic-anchors",
  "config": "path/to/opencode-semantic-anchors.yaml"
}
```

### Schnellstart

Erstelle eine Konfigurationsdatei `opencode-semantic-anchors.yaml`:

```yaml
version: "1"
profiles:
  - socratic
contracts:
  - id: custom-rule
    mode: WARN
    description: "Agent muss immer seine Quellen angeben"
    triggers:
      - type: message
        pattern: "*"
        requireSource: true
    maxOverrides: 3
```

### Vorgefertigte Profile

| Profil | Beschreibung | Anchors |
|--------|-------------|---------|
| `socratic` | Basis-Quellenprüfung | Source Anchor, Intent Anchor, Verification Anchor |
| `architecture` | Architekturentscheidungen (⚠️ erfordert separaten PR) | ADR-Format, Boundary Anchor, Stakeholder Anchor |

Profile können kombiniert werden. Mit `roleProfiles` lassen sich Profile pro Rolle zuweisen:

```yaml
roleProfiles:
  developer: ["socratic"]
  architect: ["socratic", "architecture"]
```

### Contracts (Verträge)

Ein Contract definiert, was der Agent tun (oder nicht tun) darf:

| Feld | Beschreibung |
|------|-------------|
| `id` | Eindeutige Kennung |
| `mode` | `BLOCK` (hartes Stopp) oder `WARN` (weiche Erinnerung) |
| `description` | Was der Contract durchsetzt |
| `triggers` | Muster, die den Contract aktivieren |
| `maxOverrides` | Wie viele Bypässe pro Contract erlaubt sind |

### Tools

Das Plugin registriert drei Tools in opencode:

| Tool | Beschreibung |
|------|-------------|
| `anchor-bypass` | Temporär einen blockierten Contract umgehen |
| `anchor-status` | Aktive Contracts, Zähler und aktuelle Rolle anzeigen |
| `anchor-config-reload` | Konfiguration ohne Neustart neu laden |

### Schritt-Bestätigung

Alle N Tool-Aufrufe (Standard: 3) pausiert das Plugin und fragt nach Bestätigung. Einstellbar über `settings.stepConfirmationInterval`.

### Override-Mechanismus

Wenn ein Contract eine Aktion blockiert, kann der Agent einen einmaligen Override via `anchor-bypass` anfordern. Der Override-Zähler wird beim Neuladen der Contracts zurückgesetzt. Die maximale Anzahl Overrides pro Contract ist konfigurierbar (Standard: 3).

---

## 📚 Documentation

Full documentation, including the [arc42 architecture documentation](docs/arc42/), is available in the `docs/` directory.

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md).

**Security issues** — please report via GitHub [Private Vulnerability Reporting](https://github.com/JensGrote/opencode-semantic-anchors/security/advisories) (see [SECURITY.md](SECURITY.md)).

## 📄 License

Apache-2.0 — see [LICENSE](LICENSE).
