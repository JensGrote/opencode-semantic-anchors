# 2. Architektur-Randbedingungen

## Technische Randbedingungen

| Randbedingung | Beschreibung |
|---------------|-------------|
| Plugin-SDK | Muss den opencode `Plugin`-Typ (funktionsbasierte API) mit `tool.execute.before`-Hook und `tool`-Definitionen implementieren |
| Sprache | TypeScript/JavaScript (opencode Plugin-SDK ist JS-nativ) |
| Konfigurationsformat | Dateibasiertes YAML, geladen aus dem opencode-Konfigurationsverzeichnis. Keine Datenbank. |
| Laufzeitabhängigkeiten | Keine externen HTTP-Aufrufe. Sämtliche Durchsetzungslogik läuft lokal. Muss vollständig offline funktionieren. |
| Keine Secrets | Das Plugin verwaltet niemals Passwörter, Tokens oder API-Schlüssel. Keine Integration mit age oder anderen Secret-Stores. |
| Hook-Einschränkung | Der `permission.ask`-Hook ist im aktuellen opencode instabil (Regressionen #7006, #28066). Sämtliche Durchsetzung muss `tool.execute.before` als primären Hook verwenden. |

## Fachliche Randbedingungen

| Randbedingung | Begründung |
|---------------|------------|
| Open-Source (Apache 2.0) | opencode Plugin-SDK schreibt Apache 2.0 vor; Beitragsziel ist das Repository LLM-Coding/Semantic-Anchors |
| Koexistenz mit Prompt-Instruktionen | Das Plugin verstärkt AGENTS.md-Regeln — ersetzt sie nicht. Beide Ebenen wirken zusammen. |
| Wird mit rollenbasierten Voreinstellungen ausgeliefert | Muss direkt nach der Installation für die 12 Semantic-Anchors-Rollen nutzbar sein |
| Local-first | v1 ist `.opencode/plugin/`-Lokalinstallation. npm-Veröffentlichung ist v2. |

## Organisatorische Randbedingungen

| Randbedingung | Quelle | Beschreibung |
|---------------|--------|-------------|
| Keine Leistungsüberwachung | Betriebsrat | Das Plugin darf nicht zur Messung der individuellen Entwicklerleistung verwendet werden. Nur aggregierte, anonymisierte Metriken. |
| Richtlinienprüfung erforderlich | Betriebsrat | Steuerungsregeln müssen vor der Bereitstellung überprüfbar sein. "Policy as Code" muss für Menschen lesbar sein. |
| DSGVO-konforme Protokollierung | Datenschutzbeauftragter | Umgehungs- und Verstoßprotokolle dürfen keine personenbezogenen Daten (PII) enthalten, die über das hinausgehen, was opencode bereits erfasst. |
| Prüfpfad für Compliance | Compliance-Beauftragter | Steuerungsverstöße und Umgehungen müssen mit Zeitstempel, Regel-ID und Tool-Namen protokolliert werden — jedoch nicht der Entwickleridentität. |

## Prozess-Randbedingungen

| Randbedingung | Beschreibung |
|---------------|-------------|
| Anchor-first Entwicklung | Die eigene Entwicklung des Plugins muss der Semantic-Anchors-Methodik folgen (Intent-, Negative-, Verification-, Source-Anchor). |
| Source Anchor: Doku lesen, wörtlich zitieren | Jede Behauptung muss durch ein wörtlich zitiertes Quelle belegbar sein. Keine Spekulation über Fehlerursachen oder Konzepte ohne Quellenangabe. |
| Take before Buy before Make | Bevor Code geschrieben wird, prüfen, ob eine existierende Lösung vorhanden ist (inklusive Forks, Open-Source-Komponenten, Integration vorhandener Teile). Eigenentwicklung ist das letzte Mittel. |
| Tests verpflichtend | Jede Regel und jeder Hook muss durch zugehörige Unit-Tests abgedeckt sein. Durchsetzungslogik muss verifizierbar sein. |
| Schritt-Freigabe | Jeder Entwurfs-/Implementierungsschritt erfordert explizite Benutzerbestätigung ("Weiter?") vor dem Fortfahren. |
| Markdown für Entwurfsdokumente, .adoc nur bei Beitrag | Entwurfsdokumente werden in `.md` geschrieben (effizienter). Die Konvertierung nach `.adoc` erfolgt erst bei Beitrag zum Repository LLM-Coding/Semantic-Anchors, das AsciiDoc vorschreibt. |
