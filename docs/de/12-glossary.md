# 12. Glossar

## Domain-Begriffe

| Begriff | Definition | Quelle / Referenz |
|---------|-----------|------------------|
| **Semantic Anchor** | Wohldefinierte Begriffe, Methodiken und Frameworks, die als Referenzpunkte bei der Kommunikation mit LLMs dienen. Sie aktivieren spezifische, kontextuell reichhaltige Wissensdomänen innerhalb der Trainingsdaten eines LLMs. | `docs/about.adoc`, LLM-Coding/Semantic-Anchors |
| **Semantic Contract** | Eine projektspezifische Definition dessen, was ein Begriff bedeutet — entweder durch die Kombination etablierter Anchors oder durch benutzerdefinierte Definitionen, die nur innerhalb eines Teams existieren. Anders als Anchors müssen Contracts zur Laufzeit durchgesetzt werden. | `docs/rejected-proposals.adoc`, LLM-Coding/Semantic-Anchors |
| **Anchor Eval** | Evaluierung, die testet, ob ein LLM einen Semantic Anchor *erkennt* (Wissenstest, direkte Frage). | Issue #370, LLM-Coding/Semantic-Anchors |
| **Contract Eval** | Evaluierung, die testet, ob ein LLM einen Contract *einhält* (Verhaltenstest, Aufgabe mit Systemkontext). | Issue #370, LLM-Coding/Semantic-Anchors |
| **Structural Coupling Contract** | Die interne Laufzeitrepräsentation einer Steering-Regel im Plugin. Besteht aus Contract-ID, optionalem Anchor-Referenz, Trigger-Muster, Aktion (allow/block/warn) und Modus (enforce/log). | `docs/04-solution-strategy.md` |
| **Intent Anchor** | Erster der vier Semantic Anchors. Formuliert, was passieren soll, in einer testbaren/verifizierbaren Weise. | LLM-Coding/Semantic-Anchors |
| **Negative Anchor** | Zweiter Semantic Anchor. Gibt explizit an, was NICHT passieren darf (Verbote). | LLM-Coding/Semantic-Anchors |
| **Verification Anchor** | Dritter Semantic Anchor. Definiert, wie das Ergebnis überprüft wird (Rückwärtsrekonstruktion: Ergebnis mit Intent vergleichen). | LLM-Coding/Semantic-Anchors |
| **Source Anchor** | Vierter Semantic Anchor. Jede Behauptung muss durch eine wörtlich zitierte, referenzierte Quelle belegbar sein. | LLM-Coding/Semantic-Anchors |
| **Steering Rule** | Eine konfigurierte Verhaltensrichtlinie, die das Plugin zur Laufzeit durchsetzt (z. B. „Step Confirmation nach 3 Tool-Aufrufen"). Synonym zu Structural Coupling Contract. | `docs/04-solution-strategy.md` |
| **Trigger Pattern** | Die Bedingung, die eine Steering-Regel aktiviert (z. B. `tool.execute.before` mit Aufrufzähler > N). Teil eines Structural Coupling Contract. | `docs/05-building-block-view.md` |
| **Action** | Was das Plugin tut, wenn ein Trigger auslöst: `allow` (durchlassen), `block` (Error werfen), `warn` (Warnung loggen). | `docs/05-building-block-view.md` |
| **BLOCK** | Enforcement-Modus, der die Tool-Ausführung verhindert, bis der Benutzer die Contract-Verletzung adressiert. Der Benutzer kann via `/anchor bypass` übersteuern. | `docs/04-solution-strategy.md` |
| **WARN** | Enforcement-Modus, der die Tool-Ausführung erlaubt, aber eine Erinnerungsnachricht im Log anzeigt. Wird für "weiche" Contracts verwendet, die lenken ohne zu zwingen. | `docs/04-solution-strategy.md` |
| **Hook** | Ein opencode-Plugin-Lifecycle-Callback, der Ereignisse abfängt (z. B. `tool.execute.before` fängt Tool-Aufrufe ab, `chat.message` fängt Nachrichten ab). Hooks sind die Runtime-Schnittstelle des Plugins zu opencode. | opencode Plugin SDK: https://opencode.ai/docs/plugins |
| **Mode** | Betriebsmodus eines Contract: `enforce` (aktiv blockieren/warnen) oder `log` (auswerten aber nie blocken — für Tests). | `docs/05-building-block-view.md` |

## Akronyme und Abkürzungen

| Abkürzung | Vollform | Definition |
|-----------|----------|-----------|
| **ADR** | Architecture Decision Record | Ein Dokument, das eine Architekturentscheidung, ihren Kontext, Alternativen und Konsequenzen festhält (Nygard-Format). |
| **arc42** | arc42 Template | Vorlage zur Dokumentation von Software- und Systemarchitekturen. 12 Abschnitte, die Ziele, Randbedingungen, Bausteine, Laufzeit, Deployment usw. abdecken. |
| **ATAM** | Architecture Tradeoff Analysis Method | Methode zur Bewertung von Softwarearchitekturen anhand von Qualitätsszenarien. |
| **BLUF** | Bottom Line Up Front | Kommunikationsprinzip: Beginne mit dem Ergebnis, dann folgen Details. |
| **C4 Model** | Context, Containers, Components, Code | Hierarchisches Modell zur Visualisierung von Softwarearchitektur. |
| **ISO 25010** | ISO/IEC 25010 | Systems and software Quality Requirements and Evaluation (SQuaRE) — Qualitätsmodell mit 8 Kategorien. |
| **MECE** | Mutually Exclusive, Collectively Exhaustive | Strukturierungsprinzip: Kategorien dürfen sich nicht überschneiden und müssen alle Möglichkeiten abdecken. |
| **NFR** | Non-Functional Requirement | Qualitätsattribut oder Randbedingung, die spezifiziert, wie sich ein System verhalten soll (Performanz, Sicherheit, Zuverlässigkeit usw.). |
| **PII** | Personally Identifiable Information | Daten, die eine Person identifizieren können (Namen, Adressen, Zugangsdaten). |
| **Plugin API** | opencode Plugin API | Funktionsbasierte API zur Erweiterung von opencode mit Hooks und Tools. Aktuelle API: `Plugin`-Funktion, die `{ hooks, tool }` zurückgibt. |
| **Zod** | Zod | TypeScript-first Bibliothek für Schemadefinition und Validierung. Wird für die YAML-Config-Validierung verwendet. |

## Projektspezifische Begriffe

| Begriff | Definition |
|---------|-----------|
| **Bypass** | Mechanismus, der temporär alle aktiven Block-Contracts für die aktuelle Session überschreibt. Wird über das `/anchor bypass` Tool aktiviert. |
| **Config Layer** | Die Schicht, die für das Laden, Parsen und Validieren der YAML-Konfigurationsdatei verantwortlich ist. |
| **RuleEngine** | Kernmodul, das Trigger-Bedingungen anhand des Tool-Aufruf-Kontexts auswertet und ein Urteil (allow/block/warn) zurückgibt. |
| **Hook Handler** | Der `tool.execute.before`-Hook, der Tool-Aufrufe abfängt und die Auswertung an die RuleEngine delegiert. |
| **Fail-Open** | Fehlerbehandlungsprinzip: Wenn das Plugin auf einen internen Fehler stößt, lässt es den Tool-Aufruf trotzdem zu (kein Block). Verhindert, dass Plugin-Fehler die Benutzerarbeit blockieren. |
| **Context Efficiency** | Entwurfsprinzip, dass Steering-Regeln keine LLM-Context-Tokens verbrauchen dürfen. Die gesamte Durchsetzung erfolgt über Plugin-Hooks, nicht über das System-Prompt. |
| **Step Confirmation** | Ein Contract, der nach einer konfigurierbaren Anzahl von Tool-Aufrufen eine explizite Benutzerbestätigung verlangt (z. B. „warnen nach 5, blocken nach 10"). |
| **Role-based Preset** | Ein vorkonfigurierter Satz von Contracts, zugeschnitten auf eine Persona (z. B. `developer`, `admin`, `reviewer`). Deckt 90 % der Anwendungsfälle standardmäßig ab. |
| **Reliability** | Qualitätsziel, das Determinismus (gleiche Eingabe → gleiches Urteil), Reproduzierbarkeit (Session-Wiederholung produziert identische Ausgabe), Nachvollziehbarkeit (jede Entscheidung wird mit Contract-ID und Regelstatus geloggt) und Vorhersagbarkeit (konsistentes Agentenverhalten) umfasst. |

## Architekturbegriffe

| Begriff | Definition |
|---------|-----------|
| **3-Layer-Architektur** | Plugin-Struktur: Config Layer (laden/validieren) → RuleEngine (auswerten) → Hook Handler (abfangen). |
| **Proxy Module** | Internes Modul, das die RuleEngine-Ausgabe an die Konventionen der opencode Plugin API anpasst (throw für Block, log für Warn). |
| **Custom Tool** | Ein Tool, das das Plugin dem LLM zur Verfügung stellt (z. B. `/anchor bypass`, `/anchor status`). |
| **Anchor Ref** | Optionale Referenz von einem Structural Coupling Contract zurück zu einer Semantic-Anchor-Definition. Ermöglicht die Rückverfolgbarkeit von der Durchsetzung zur Methodik. |
| **Nygard Format** | ADR-Format von Michael Nygard: Kontext, Entscheidung, Konsequenzen. Wird für alle Architekturentscheidungen in diesem Projekt verwendet. |
