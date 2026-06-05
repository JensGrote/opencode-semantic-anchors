# opencode-semantic-anchors – Plan

## Vision
Ein opencode-Plugin, das die Semantic-Anchors-Methodologie zur Laufzeit durchsetzt – blockt/warnt bei Verstößen, statt auf Selbstdisziplin per Prompt zu vertrauen.

## Phasen

### Phase 1: Design (⏳ aktuell)
- arc42-Design-Dokument schreiben
- Vom Benutzer genehmigen lassen

### Phase 2: Prototyp
- Minimal Viable Plugin: `tool.execute.before` Hook
- Regel: Step Confirmation Anchor (block nach N Tool-Calls)
- Konfiguration via YAML
- Custom Tool: `/anchor bypass`

### Phase 3: Erweiterung
- Source Anchor Enforcement
- Intent Anchor Enforcement (via `chat.message` Hook)
- Role-based Presets

### Phase 4: Reifung
- Tests (Unit + Integration)
- README + Contribution Guide
- npm-Paket bauen

### Phase 5: Contribution
- PR ans Semantic-Anchors-Repo: Eintrag in README/CLAUDE.md (Cross-Link, kein Subtree)
- Eintrag im opencode Ecosystem (https://opencode.ai/docs/ecosystem#plugins)
- Veröffentlichung auf npm aus eigenem Standalone-Repo

## Nicht-Ziele (Scope-Grenzen)
- Kein NLP/LLM zur Intent-Erkennung (V1)
- Keine Runtime-Fetches von GitHub
- Kein Dashboard / GUI
