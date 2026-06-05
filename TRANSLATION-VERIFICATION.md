# Translation Verification Report

> **Status:** In Progress
> **Method:** Original German → English translation, checked against Intent (fachliche Korrektheit) and Domain Correctness

## File 1: `01-introduction-and-goals.md`

| # | Original (DE) | Translation (EN) | Intent preserved? | Assessment |
|---|---------------|------------------|-------------------|------------|
| 1 | `**Semantic Anchor** (was der LLM bereits kann)` | `**Semantic Anchor** (what the LLM already knows)` | ✅ Präzise | GREEN |
| 2 | `**Semantic Contract** (was projektspezifisch durchgesetzt werden muss)` | `**Semantic Contract** (what must be enforced project-specifically)` | ✅ Fachlich korrekt | GREEN |
| 3 | `Die Evaluierung unterscheidet entsprechend:` | `The evaluation distinguishes accordingly:` | ✅ Wörtlich, Intent klar | GREEN |
| 4 | `**Source Anchor (wörtlich zitieren, nicht paraphrasieren):** Jede Behauptung im Design muss aus einer wörtlich zitierten Quelle belegbar sein. Keine Spekulation über Fehlerursachen oder Konzepte ohne Quellenangabe.` | `**Source Anchor (cite verbatim, do not paraphrase):** Every claim in the design must be verifiable through a verbatim quoted source. No speculation about error causes or concepts without a source citation.` | ✅ Source-Anchor-Prinzip exakt | GREEN |
| 5 | `**Take before Buy before Make:** Bevor eigener Code geschrieben wird, muss geprüft werden, ob es eine existierende Lösung gibt – inklusive Fork/OpenSource. "Buy" umfasst auch die Integration bestehender Open-Source-Komponenten.` | `**Take before Buy before Make:** Before writing any code, check whether an existing solution exists — including forks and open-source components. "Buy" includes integrating existing open-source components.` | ✅ Prinzip exakt | GREEN |

**Fazit 01:** ✅ 5/5 GREEN — keine Abweichungen.

---

## File 2: `02-architecture-constraints.md`

| # | Original (DE) | Translation (EN) | Intent preserved? | Assessment |
|---|---------------|------------------|-------------------|------------|
| 1 | `Source Anchor: doku lesen, wörtlich zitieren \| Jede Behauptung muss aus einer wörtlich zitierten Quelle belegbar sein. Keine Spekulation über Fehlerursachen oder Konzepte ohne Quellenangabe.` | `Source Anchor: read docs, cite verbatim \| Every claim must be verifiable through a verbatim quoted source. No speculation about error causes or concepts without a source citation.` | ✅ | GREEN |
| 2 | `Take before Buy before Make \| Bevor eigener Code geschrieben wird, muss geprüft werden, ob es eine existierende Lösung gibt (inkl. Fork/OpenSource/Integration bestehender Komponenten). Eigenbau ist der letzte Weg.` | `Take before Buy before Make \| Before writing any code, check whether an existing solution exists (including forks, open-source components, integration of existing parts). Custom development is the last resort.` | ✅ "Eigenbau ist der letzte Weg" → "Custom development is the last resort" — intent preserved | GREEN |
| 3 | `Markdown für Design-Doku, .adoc nur bei Contribution \| Design-Dokumente werden in .md geschrieben (effizienter). Konvertierung nach .adoc erfolgt erst bei Contribution ins LLM-Coding/Semantic-Anchors Repository, das AsciiDoc als Standard verwendet.` | `Markdown for design docs, .adoc only at contribution \| Design documents are written in .md (more efficient). Conversion to .adoc occurs only at contribution time to the LLM-Coding/Semantic-Anchors repository, which mandates AsciiDoc.` | ✅ | GREEN |

**Fazit 02:** ✅ 3/3 GREEN.

---

## File 3: `03-system-scope-and-context.md`

| # | Original (DE) | Translation (EN) | Intent preserved? | Assessment |
|---|---------------|------------------|-------------------|------------|
| 1 | `### Position im Semantic-Anchors-Ökosystem` | `### Position in the Semantic-Anchors Ecosystem` | ✅ | GREEN |
| 2 | `Das LLM-Coding/Semantic-Anchors Repository bietet bereits Integrationen für mehrere Coding Agents:` | `The LLM-Coding/Semantic-Anchors repository already provides integrations for several coding agents:` | ✅ | GREEN |
| 3 | `Art` (column header) → `Projekt-Context` | `Type` → `Project Context` | ✅ | GREEN |
| 4 | `**opencode** | **\`opencode-semantic-anchors\` (dieses Plugin)** | **Runtime Enforcement via Hooks**` | `**opencode** | **\`opencode-semantic-anchors\` (this plugin)** | **Runtime Enforcement via Hooks**` | ✅ | GREEN |
| 5 | `Dieses Plugin ist der opencode-spezifische Beitrag zum Semantic-Anchors-Ökosystem. Es wird als plugins/opencode-semantic-anchors/ in das Repository eingebracht und von dort aus der opencode-Community zugänglich gemacht — analog zum bestehenden Claude Code Plugin unter plugins/semantic-anchors/.` | `This plugin is the opencode-specific contribution to the Semantic-Anchors ecosystem. It will be contributed as plugins/opencode-semantic-anchors/ into the repository and made available to the opencode community — analogous to the existing Claude Code plugin at plugins/semantic-anchors/.` | ✅ | GREEN |
| 6 | `Take before Buy before Make (angewandt): Statt ein weiteres "Anchor-Block into AGENTS.md"-Tool zu bauen (das existiert bereits im Onboarding-Skill), konzentriert sich dieses Plugin auf die Lücke, die kein bestehendes Integrationsteil abdeckt: Runtime Enforcement via Plugin-Hooks.` | `Take before Buy before Make (applied): Instead of building another "Anchor-Block into AGENTS.md" tool (which already exists in the Onboarding Skill), this plugin focuses on the gap that no existing integration covers: Runtime Enforcement via Plugin Hooks.` | ✅ | GREEN |

**Fazit 03:** ✅ 6/6 GREEN.

---

## File 4: `04-solution-strategy.md`

| # | Original (DE) | Translation (EN) | Intent preserved? | Assessment |
|---|---------------|------------------|-------------------|------------|
| 1 | `**Layer 1 – Configuration:** YAML-Datei im opencode-Config-Verzeichnis. Definiert Structural Coupling Contracts als Kombination von Triggern (tool, message, state) und Action (BLOCK, WARN). Enthält Role-based Presets für die 12 Semantic-Anchors-Rollen.` | `**Layer 1 – Configuration:** YAML file in the opencode config directory. Defines Structural Coupling Contracts as a combination of triggers (tool, message, state) and actions (BLOCK, WARN). Contains role-based presets for the 12 Semantic-Anchors roles.` | ✅ | GREEN |
| 2 | `**Layer 2 – Rule Engine:** Kernlogik. Validiert Config gegen Schema, matched eingehende Events gegen aktive Contracts, evaluiert den Verdikt (ALLOW, BLOCK, WARN). Hält Session-State (tool-call-count, override-count, role).` | `**Layer 2 – Rule Engine:** Core logic. Validates config against schema, matches incoming events against active contracts, evaluates the verdict (ALLOW, BLOCK, WARN). Maintains session state (tool-call-count, override-count, role).` | ✅ | GREEN |
| 3 | `**Layer 3 – Hooks & Tools:** Dünne Adapter. tool.execute.before ist der primäre Enforcement-Punkt. chat.message gibt sanfte Reminder. agent.activate lädt Rollen-Presets. Custom Tools erlauben Bypass, Status-Abfrage und Config-Reload.` | `**Layer 3 – Hooks & Tools:** Thin adapters. tool.execute.before is the primary enforcement point. chat.message provides gentle reminders. agent.activate loads role presets. Custom tools enable bypass, status query, and config reload.` | ✅ "Dünne Adapter" → "Thin adapters" ist wörtlich | GREEN |
| 4 | `Source Anchor (Quelle): opencode Plugin SDK Dokumentation: https://... Siehe insbesondere das Plugin-Type (funktionsbasierte API) mit hooks und tool-Definitionen.` | `Source Anchor (source): opencode Plugin SDK documentation: https://... See in particular the Plugin type (function-based API) with hooks and tool definitions.` | ✅ | GREEN |
| 5 | `| permission.ask \| Ist instabil in current opencode (Regression Issues #7006, #28066) |` | `| permission.ask \| Unstable in current opencode (Regression Issues #7006, #28066) |` | ✅ "Ist instabil in current..." → das "in current" war bereits Englisch im Original | GREEN |
| 6 | `tool.execute.before \| Stabil, kann allow/block zurückgeben, erlaubt overrideTool` | `tool.execute.before \| Stable, can return allow/block, supports overrideTool` | ✅ | GREEN |
| 7 | `Source Anchor (Quelle): opencode GitHub Issues #7006 und #28066 betreffen Regressionen im permission.ask Hook. Stand: Juni 2026.` | `Source Anchor (source): opencode GitHub Issues #7006 and #28066 concern regressions in the permission.ask hook. Status: June 2026.` | ✅ "betreffen" → "concern" ist etwas formeller, Intent gleich | GREEN |
| 8 | `### Decision 2: Structural Coupling Contract statt direkter Anchor-Enforcement` | `### Decision 2: Structural Coupling Contract instead of direct Anchor Enforcement` | ✅ | GREEN |
| 9 | `| Begriff \| Definition \| Verwendung im Plugin |` | `| Term \| Definition \| Usage in Plugin |` | ✅ | GREEN |
| 10 | `Semantic Anchor \| Wissen, das das LLM aus Training kennt \| Optional als Source/Referenz im Contract vermerkt (anchorRefs-Feld)` | `Semantic Anchor \| Knowledge the LLM already knows from training \| Optionally noted as source/reference in the contract (anchorRefs field)` | ✅ | GREEN |
| 11 | `Semantic Contract \| Projekt-lokale, maschinell durchsetzbare Regel \| Ist die eigentliche Enforcement-Einheit` | `Semantic Contract \| Project-local, machine-enforceable rule \| This is the actual enforcement unit` | ✅ | GREEN |
| 12 | `Autor: Ralf D. Müller (Maintainer). Keine Autorenzeile in der Datei, aber der Commit-Historie zufolge von rweisleder und raifdmueller.` | `Author: Ralf D. Müller (Maintainer). No author line in the file, but the commit history shows contributions by rweisleder and raifdmueller.` | ✅ | GREEN |
| 13 | `### Decision 3: YAML-Config (nicht JSON, nicht AsciiDoc)` | `### Decision 3: YAML Config (not JSON, not AsciiDoc)` | ✅ | GREEN |
| 14 | `YAML ist: - Lesbarer als JSON für Regeldefinitionen - Diff-freundlich (eine Zeile Änderung = eine Zeile Diff) - Bereits etabliert für vergleichbare Ansätze` | `YAML is: - More readable than JSON for rule definitions - Diff-friendly (one line change = one line diff) - Already established for comparable approaches` | ✅ "Diff-freundlich" → "Diff-friendly" — Lehnübersetzung, ok | GREEN |
| 15 | `Take before Buy before Make: YAML als Format für agenten-bezogene Verträge ist bereits in agentcontract/spec etabliert.` | `Take before Buy before Make: YAML as a format for agent-related contracts is already established in agentcontract/spec.` | ✅ | GREEN |
| 16 | `Source Anchor (Quelle): AgentContract Specification. ... Definiert .contract.yaml als Standard-Format für Agent Contracts mit Pre/Postconditions, Invariants und Limits. ... Siehe Abschnitt 2 (Contract Format) für das YAML-Schema.` | `Source Anchor (source): AgentContract Specification. ... Defines .contract.yaml as the standard format for Agent Contracts with pre/postconditions, invariants, and limits. ... See Section 2 (Contract Format) for the YAML schema.` | ✅ | GREEN |
| 17 | `Wir übernehmen das Format, nicht das gesamte Schema – da agentcontract/spec auf CI-Gates und Framework-agnostische Enforcement ausgerichtet ist, während unser Plugin opencode-spezifische Hooks nutzt.` | `We adopt the format, not the full schema — because agentcontract/spec targets CI gates and framework-agnostic enforcement, while our plugin uses opencode-specific hooks.` | ✅ | GREEN |
| 18 | `### Decision 4: Take before Buy before Make als Plugin-Entwicklungs-Prinzip` | `### Decision 4: Take before Buy before Make as Plugin Development Principle` | ✅ | GREEN |
| 19 | Entscheidungsbaum (DE): `1. Take – Existiert etwas, das wir direkt nutzen können? 2. Buy – Können wir eine OpenSource-Komponente forken/integrieren? 3. Make – Eigenentwicklung nur für den opencode-spezifischen Teil` | Decision tree (EN): `1. Take – Does something already exist that we can use directly? 2. Buy – Can we fork/integrate an open-source component? 3. Make – Custom development only for the opencode-specific part` | ✅ | GREEN |
| 20 | `### Decision 5: Source Anchor als Architektur-Prinzip` | `### Decision 5: Source Anchor as Architecture Principle` | ✅ | GREEN |
| 21 | Source-Anchor-Begründung (DE) | Source-Anchor rationale (EN) | ✅ | GREEN |
| 22 | `### Decision 6: Markdown für Design-Dokumentation (nicht AsciiDoc)` | `### Decision 6: Markdown for Design Documentation (not AsciiDoc)` | ✅ | GREEN |
| 23 | Begründung (DE): `Geringere kognitive Last während der Design-Phase. Bessere Diff-Lesbarkeit. Einfachere Tool-Unterstützung (kein AsciiDoc-Compiler nötig).` | Rationale (EN): `Lower cognitive load during the design phase. Better diff readability. Simpler tool support (no AsciiDoc compiler required).` | ✅ | GREEN |
| 24 | `Die Konvertierung nach .adoc erfolgt erst bei Contribution ins Semantic-Anchors Repository.` | `Conversion to .adoc occurs only at contribution time to the Semantic-Anchors repository.` | ✅ | GREEN |
| 25 | `Source Anchor (Quelle): Das Semantic-Anchors Repository schreibt vor: "AsciiDoc is mandatory — Do not convert to Markdown" (CLAUDE.md). Diese Regel gilt für Inhalte, die ins Repository eingebracht werden. Für lokale Design-Dokumente gilt sie nicht.` | `Source Anchor (source): The Semantic-Anchors repository mandates: "AsciiDoc is mandatory — Do not convert to Markdown" (CLAUDE.md). This rule applies to content contributed to the repository. For local design documents, it does not apply.` | ✅ "schreibt vor" → "mandates" ist präziser/stärker als "requires" — intentional, da es eine harte Regel ist | GREEN |
| 26 | Quality Goal Table (DE): `BLOCK-Modus ... verhindert Tool-Ausführung bei Vertragsverstoß. ... Gleiche Config → gleiche Contracts ... Rule Engine <50ms pro Check. ...` | Quality Goal Table (EN): `BLOCK mode ... prevents tool execution on contract violation. ... Same config → same contracts ... Rule Engine <50ms per check. ...` | ✅ | GREEN |

**Fazit 04:** ✅ 26/26 GREEN.

---

## File 5: `05-building-block-view.md`

| # | Original (DE) | Translation (EN) | Intent preserved? | Assessment |
|---|---------------|------------------|-------------------|------------|
| 1 | `Responsibility: Registriert Hooks und Tools bei opencode. Initialisiert Config und Rule Engine beim Laden.` | `Responsibility: Registers hooks and tools with opencode. Initialises config and Rule Engine at load time.` | ✅ | GREEN |
| 2 | `// Config + RuleEngine werden hier initialisiert` | `// Config + RuleEngine are initialised here` | ✅ Code-Kommentar | GREEN |
| 3 | `Source Anchor (Quelle): opencode Plugin SDK — Basic Structure (funktionsbasierte API).` | `Source Anchor (source): opencode Plugin SDK — Basic Structure (function-based API).` | ✅ | GREEN |
| 4 | `Hinweis: Die chat.message und agent.activate Hooks sind in der aktuellen Plugin-Doku noch nicht als Standard-Hooks dokumentiert. Sie können bei Bedarf über das generische event-System angebunden werden.` | `Note: The chat.message and agent.activate hooks are not yet documented as standard hooks in the current plugin docs. They can be connected via the generic event system if needed.` | ✅ | GREEN |
| 5 | `// Lädt Config + validiert` | `// Loads config + validates` | ✅ | GREEN |
| 6 | `// Lädt neu (für /anchor config-reload)` | `// Reloads (for /anchor config-reload)` | ✅ | GREEN |
| 7 | `// Abgeleitete Typen` | `// Derived types` | ✅ | GREEN |
| 8 | `Evaluierungs-Reihenfolge: 1. Prüfe Step Confirmation... 2. Prüfe aktive Contracts... 3. Erster Match gewinnt... 4. Kein Match → ALLOW` | `Evaluation order: 1. Check Step Confirmation... 2. Check active contracts... 3. First match wins... 4. No match → ALLOW` | ✅ | GREEN |
| 9 | `Source Anchor (Quelle): Rollen-Definitionen aus dem LLM-Coding/Semantic-Anchors Repository.` | `Source Anchor (source): Role definitions from the LLM-Coding/Semantic-Anchors repository.` | ✅ | GREEN |
| 10 | `Hinweis: Die aktuelle opencode Plugin-Doku listet keinen dedizierten chat.message Hook.` | `Note: The current opencode plugin docs do not list a dedicated chat.message hook.` | ✅ | GREEN |
| 11 | `Hinweis: Die aktuelle opencode Plugin-Doku listet keinen dedizierten agent.activate Hook.` | `Note: The current opencode plugin docs do not list a dedicated agent.activate hook.` | ✅ | GREEN |
| 12 | `Take before Buy before Make: Dieser Datenfluss folgt dem opencode Plugin SDK Pattern: throw new Error() blockt die Tool-Ausführung... Der Bypass-Mechanismus nutzt einen Custom Tool-Aufruf, der den Override-Zähler incrementiert...` | `Take before Buy before Make: This data flow follows the opencode Plugin SDK pattern: throw new Error() blocks the tool execution... The bypass mechanism uses a custom tool call that increments the override counter...` | ✅ | GREEN |
| 13 | `Bei jedem Fehler in einem Hook gibt das Plugin { allow: true } zurück, damit der Agent nicht blockiert wird.` | `On any error in a hook, the plugin returns { allow: true } so that the agent is not blocked.` | ✅ | GREEN |
| 14 | Fehler-Layer-Tabelle (DE) | Error layer table (EN) | ✅ | GREEN |
| 15 | `Begründung: Das Plugin ist ein runtime steering tool, kein Sicherheitslayer. Ein blockierender Fehler würde die gesamte opencode-Session lahmlegen.` | `Rationale: The plugin is a runtime steering tool, not a security layer. A blocking error would crash the entire opencode session.` | ✅ "lahmlegen" → "crash" — leicht stärker, aber fachlich korrekt | GREEN |
| 16 | `Source Anchor (Quelle): opencode Plugin SDK — .env protection example demonstriert, dass throw new Error() in tool.execute.before die Tool-Ausführung unterbricht. Unser Fail-Open fängt diesen Throw ab...` | `Source Anchor (source): opencode Plugin SDK — .env protection example demonstrates that throw new Error() in tool.execute.before interrupts tool execution. Our Fail-Open catches this throw...` | ✅ | GREEN |
| 17 | `### Fehlerszenarien pro Layer` | `### Error scenarios per layer` | ✅ | GREEN |
| 18 | `Verhalten: - Ungültiges YAML → Default-Konfiguration... - Fehlerdetails werden via client.app.log() geloggt - Plugin startet trotzdem — keine Blockade` | `Behaviour: - Invalid YAML → Default configuration... - Error details are logged via client.app.log() - Plugin still starts — no blockade` | ✅ | GREEN |
| 19 | `Betroffene Interfaces:` (2x) | `Affected interfaces:` (2x) | ✅ | GREEN |
| 20 | `Verhalten: - Jeder Throw in evaluate() wird vom Hook-Handler gefangen - RuleEngine hat keine externen Abhängigkeiten - SessionState wird bei jedem Fehler nicht zurückgesetzt` | `Behaviour: - Every throw in evaluate() is caught by the hook handler - RuleEngine has no external dependencies - SessionState is not reset on error` | ✅ | GREEN |
| 21 | `// Garantie: evaluate() wirft nicht nach außen. // Interne Errors werden geloggt, Rückgabe ist immer Verdict.` | `// Guarantee: evaluate() does not throw externally. // Internal errors are logged, return value is always Verdict.` | ✅ | GREEN |
| 22 | `Was passiert bei einem Bug im Hook-Handler selbst: - opencode fängt den Throw und behandelt den Hook als fehlgeschlagen - Die Tool-Ausführung läuft trotzdem weiter (opencodes eigenes Fail-Open) - Plugin hat keine Möglichkeit, den Fehler zu loggen` | `What happens when there is a bug in the hook handler itself: - opencode catches the throw and treats the hook as failed - Tool execution still proceeds (opencode's own fail-open) - Plugin has no way to log the error` | ✅ | GREEN |
| 23 | `Source Anchor (Quelle): opencode Plugin SDK dokumentiert nicht explizit, wie opencode mit throwenden Hooks umgeht. Der .env protection-Code zeigt throw new Error() als legitimes Mittel zum Blocken — also fängt opencode den Throw und wertet ihn als Block. Unser Fail-Open soll sicherstellen, dass wir NICHT ungewollt blocken.` | `Source Anchor (source): The opencode Plugin SDK does not explicitly document how opencode handles throwing hooks. The .env protection code shows throw new Error() as a legitimate way to block — so opencode catches the throw and interprets it as a block. Our Fail-Open ensures we do NOT accidentally block.` | ✅ "ungewollt blocken" → "accidentally block" — Intent exakt | GREEN |
| 24 | `Einziger definierter Error-Pfad in Custom Tools. Der maxOverrides-Check verhindert unendliche Bypässe.` | `Only defined error path in Custom Tools. The maxOverrides check prevents infinite bypasses.` | ✅ | GREEN |
| 25 | Logging-Strategie-Tabelle (DE): `Parse-Fehler, Validierungs-Fehler, State-Korruption, Matcher-Fehler, Verdict-Ergebnisse` | Logging strategy table (EN): `Parse errors, validation errors, State corruption, matcher errors, Verdict results` | ✅ | GREEN |
| 26 | `Source Anchor (Quelle): opencode Plugin SDK — Logging API.` | `Source Anchor (source): opencode Plugin SDK — Logging API.` | ✅ | GREEN |
| 27 | Graceful-Degradation-Tabelle (DE): `Totalausfall, Teilausfall` → `Settings-Feld fehlt → Default-Wert` | Graceful Degradation table (EN): `Total failure, Partial failure` → `Settings field missing → default value` | ✅ | GREEN |
| 28 | `### Zusammenfassung Error-Handling-Architektur` | `### Error Handling Architecture Summary` | ✅ | GREEN |

**Fazit 05:** ✅ 28/28 GREEN.

---

## File 6: `06-runtime-view.md`

| # | Original (DE) | Translation (EN) | Intent preserved? | Assessment |
|---|---------------|------------------|-------------------|------------|
| 1 | `Config->>Config: validate gegen Zod-Schema` | `Config->>Config: validate against Zod schema` | ✅ | GREEN |
| 2 | `Tritt ein, wenn ein aktiver Contract einen BLOCK auslöst (z.B. Step Confirmation nach 3 Tool-Calls ohne "Weiter?"):` | `Occurs when an active contract triggers a BLOCK (e.g., Step Confirmation after 3 tool calls without "Weiter?"):` | ✅ "Tritt ein" → "Occurs" ist wörtlich | GREEN |
| 3 | `Tritt ein, wenn ein Contract im WARN-Modus matched (z.B. Source Anchor bei write ohne vorherige Quellenangabe):` | `Occurs when a contract matches in WARN mode (e.g., Source Anchor on write without prior source citation):` | ✅ | GREEN |
| 4 | `Kein Blocking, nur sanfte Reminder:` | `No blocking, only gentle reminders:` | ✅ "sanfte Reminder" → "gentle reminders" — wörtlich | GREEN |
| 5 | `Fail-Open Prinzip: Bei jedem Fehler in einem Hook gibt das Plugin { allow: true } zurück, damit der Agent nicht blockiert wird. Der Fehler wird geloggt. Dieses Verhalten ist in 05-building-block-view.md Section "Error Handling" (vier Szenarien: Config/RuleEngine/Hook/Tool) spezifiziert.` | `Fail-Open principle: On any error in a hook, the plugin returns { allow: true } so the agent is not blocked. The error is logged. This behaviour is specified in 05-building-block-view.md section "Error Handling" (four scenarios: Config/RuleEngine/Hook/Tool).` | ✅ | GREEN |
| 6 | `Beim Neuladen des Plugins (z.B. nach Config-Change + /anchor config-reload): ... ConfigLoader liest YAML neu. Validiert gegen Zod-Schema. RuleEngine wird mit neuer Config initialisiert. SessionState wird zurückgesetzt. Rolle bleibt erhalten.` | `On plugin reload (e.g., after config change + /anchor config-reload): ... ConfigLoader re-reads YAML. Validates against Zod schema. RuleEngine is initialised with new config. SessionState is reset. Role is preserved.` | ✅ "Rolle bleibt erhalten" → "Role is preserved" — präzise | GREEN |

**Fazit 06:** ✅ 6/6 GREEN.

---

## File 8: `08-quality-requirements.md`

| # | Original (DE) | Translation (EN) | Intent preserved? | Assessment |
|---|---------------|------------------|-------------------|------------|
| 1 | `Der Quality Tree leitet sich aus den Quality Goals (Section 1) ab und bricht sie in messbare Sub-Charakteristiken herunter. Basis ist ISO 25010.` | `The Quality Tree derives from the Quality Goals (Section 1) and breaks them down into measurable sub-characteristics. Based on ISO 25010.` | ✅ | GREEN |
| 2 | `Source Anchor (Quelle): ISO 25010 Quality Model. ... Unterteilt Software-Qualität in 8 Hauptkategorien...` | `Source Anchor (source): ISO 25010 Quality Model. ... Divides software quality into 8 main categories...` | ✅ "Unterteilt" → "Divides" | GREEN |
| 3 | `Jedes Quality Goal wird durch ein konkretes Quality Scenario spezifiziert (Quelle: arc42-Vorlage, nach Bosch / ATAM).` | `Each Quality Goal is specified by a concrete Quality Scenario (source: arc42 template, after Bosch / ATAM).` | ✅ | GREEN |
| 4 | Scenario 1: `User (oder bösartiger Agent)` → `Hook wirft new Error()` → `100% der Verstösse werden geblockt` | Scenario 1: `User (or malicious agent)` → `Hook throws new Error()` → `100% of violations are blocked` | ✅ "bösartiger Agent" → "malicious agent" — intent preserved | GREEN |
| 5 | Scenario 2: `Lädt dieselbe opencode-Session zweimal mit identischer Config` → `Gleiche Tool-Call-Sequenz → gleiche Verdicts` → `100% Reproduzierbarkeit` | Scenario 2: `Loads the same opencode session twice with identical config` → `Same tool call sequence → same verdicts` → `100% reproducibility` | ✅ | GREEN |
| 6 | Scenario 3: `Fail-Open: Tool läuft durch, Fehler wird geloggt. Kein Session-Abbruch.` → `100% der Hook-Fehler führen zu allow` | Scenario 3: `Fail-Open: tool proceeds, error is logged. No session abort.` → `100% of hook errors result in allow` | ✅ | GREEN |
| 7 | Scenario 4: `Neuer User` → `Config-Datei` → `User kann in <5 Minuten eine neue Regel ohne Doku-Nachschlagen definieren` | Scenario 4: `New user` → `config file` → `User can define a new rule in <5 minutes without consulting documentation` | ✅ | GREEN |
| 8 | Scenario 5: `Installiert ein zweites opencode-Plugin` → `Beide Plugins laufen ohne Konflikte. Kein shared mutable state.` | Scenario 5: `Installs a second opencode plugin` → `Both plugins run without conflicts. No shared mutable state.` | ✅ | GREEN |
| 9 | Scenario 6: `Führt eine Session mit aktiven Steering-Contracts durch` → `Der LLM-Context-Window enthält KEINE Steering-Regeln` → `System-Prompt-Grösse ist identisch` | Scenario 6: `Runs a session with active steering contracts` → `The LLM context window contains NO steering rules` → `System prompt size is identical` | ✅ | GREEN |
| 10 | Scenario 7: `Config enthält 5 Contracts, einer davon hat ein ungültiges Trigger-Pattern` → `4 gültige Contracts werden geladen, 1 fehlerhafter wird geloggt und ignoriert` | Scenario 7: `Config contains 5 contracts, one of which has an invalid trigger pattern` → `4 valid contracts are loaded, 1 faulty contract is logged and ignored` | ✅ | GREEN |
| 11 | ISO 25010 Mapping (DE): `Relevante Quality Goals, Messung` → `Test-Suite: 100% Block-Rate bei Verstössen` → `Fehler-Injektions-Test: 100% allow bei Fehlern` | ISO 25010 Mapping (EN): `Relevant Quality Goals, Measurement` → `Test suite: 100% block rate on violations` → `Error injection test: 100% allow on errors` | ✅ | GREEN |
| 12 | `Source Anchor (Quelle): ISO 25010:2011 ... Die 8 Qualitätskategorien sind dort definiert.` | `Source Anchor (source): ISO 25010:2011 ... The 8 quality categories are defined there.` | ✅ | GREEN |
| 13 | `8.4 Verifikation der Quality Goals` | `8.4 Verification of Quality Goals` | ✅ | GREEN |
| 14 | Verification table (DE): `Unit-Tests (RuleEngine)` → `100% der Test-Contracts werden korrekt evaluiert` → `Fail-Open Integrationstest` → `Prompt-Grösse ohne/mit Plugin identisch` | Verification table (EN): `Unit tests (RuleEngine)` → `100% of test contracts are evaluated correctly` → `Fail-Open Integration Test` → `Prompt size identical without/with plugin` | ✅ | GREEN |

**Fazit 08:** ✅ 14/14 GREEN.

---

## Gesamtbewertung

| Datei | Geprüft | Abweichungen | Status |
|-------|---------|-------------|--------|
| `01-introduction-and-goals.md` | 5 | 0 | ✅ |
| `02-architecture-constraints.md` | 3 | 0 | ✅ |
| `03-system-scope-and-context.md` | 6 | 0 | ✅ |
| `04-solution-strategy.md` | 26 | 0 | ✅ |
| `05-building-block-view.md` | 28 | 0 | ✅ |
| `06-runtime-view.md` | 6 | 0 | ✅ |
| `08-quality-requirements.md` | 14 | 0 | ✅ |
| **Total** | **88** | **0** | **✅ ALLE GREEN** |

**Fazit:** Alle 88 Übersetzungen sind **intent-treu und fachlich korrekt**. Keine Abweichungen gefunden, die eine Nachbesserung erfordern.

**Hinweis:** Das "Weiter?" in Sequence-Diagrammen (Step Confirmation) wurde bewusst nicht übersetzt — es ist der tatsächliche Prompt-Keyword des Workflows und wäre falsch als "Continue?" übersetzt.
