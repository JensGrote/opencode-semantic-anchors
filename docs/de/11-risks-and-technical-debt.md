# 11. Risiken und technische Schulden

## 11.1 Überblick

Dieser Abschnitt analysiert die Risiken und technischen Schulden des opencode-semantic-anchors-Plugins. Risiken werden nach Wahrscheinlichkeit und Auswirkung bewertet; technische Schulden werden mit ihrem geschätzten Behebungsaufwand dokumentiert.

## 11.2 Risikomatrix

| ID | Risiko | Wahrscheinlichkeit | Auswirkung | Priorität | Maßnahme |
|----|--------|-------------------|------------|-----------|-----------|
| R1 | docToolchain-Build-Pipeline bricht (AsciiDoc-Warnungen, jBake-Header-Probleme, exportMarkdown-Regressionen) | Mittel | Hoch | Hoch | Pinnung der docToolchain-Version (3.5.0); CI führt die vollständige Pipeline bei jedem Push aus; Build-Fehler blockieren die Entwicklung nicht |
| R2 | Englische und deutsche Dokumentationsversionen synchronisieren sich nicht | Mittel | Mittel | Mittel | Gepaarter Review-Prozess; TRANSLATION-VERIFICATION-Prüfungen; docToolchain verarbeitet beide Sets einheitlich |
| R3 | API-Änderungen im opencode Plugin SDK brechen das Plugin | Niedrig | Hoch | Hoch | Aktuelle API (funktionsbasiert, ADR-010); Pinnung der opencode-Version in CI; Regressionstestsuite läuft bei jedem opencode-Release |
| R4 | Abhängigkeit von bestimmten opencode-Versionen (tool.execute.before-Hook-Verhalten) | Niedrig | Mittel | Mittel | Fail-Open-Design (ADR-008) gewährleistet Graceful Degradation; Migrationspfad für permission.ask dokumentiert (ADR-001) |
| R5 | Testabdeckung für Randfälle der Konfigurationsanalyse und Fehlerbehandlung ist unvollständig | Mittel | Niedrig | Mittel | Abdeckungsziele definiert (>80%); TDD-Vorgabe; Gap-Analyse geplant |
| R6 | Dokumentation wird mit der Codebasis nicht aktuell gehalten | Mittel | Mittel | Mittel | Single-Source-of-Truth-Prinzip (docs/ ist maßgeblich); docToolchain-Build validiert alle Querverweise |
| R7 | Einzelentwickler-Risiko (Bus-Faktor = 1) | Hoch | Mittel | Hoch | CI/CD automatisiert Builds; Open-Source-Community-Beiträge möglich; Architektur in ADRs dokumentiert |

## 11.3 Detailanalysen der Risiken

### R1: Stabilität der docToolchain-Build-Pipeline

Der Dokumentationsbuild basiert auf docToolchain 3.5.0 (Java 17, Gradle) mit einer mehrstufigen Pipeline: `exportMarkdown` -> Kopieren + Hinzufügen von jBake-Headern -> Entfernen von `.md`-Dateien -> `generateSite` (siehe ADR-007). Jede Stufe ist ein potenzieller Fehlerpunkt:

- **exportMarkdown** kann bei komplexen Markdown-Tabellen oder Mermaid-Diagrammen AsciiDoc mit Warnungen erzeugen
- **jBake-Header-Injektion** ist ein benutzerdefiniertes Shell-Script -- Änderungen am Header-Format in docToolchain-Updates wurden den Build brechen
- **Mermaid -> PlantUML-Konvertierung** ist nicht automatisiert; Beiträge zum Semantic-Anchors-Repository erfordern manuelle Diagrammkonvertierung

**Maßnahme:** Der CI-Workflow (`deploy-docs.yml`) ist die maßgebliche Referenz. Lokale Builds sind in `08-Konzepte/01-installation.md` schrittweise dokumentiert. Die docToolchain-Version ist in `docToolchainConfig.groovy` fixiert.

**Verwandt:** ADR-007 (Markdown for Design Docs), `08-Konzepte/01-installation.md`, `.github/workflows/deploy-docs.yml`

### R2: Synchronisation der zweisprachigen Dokumentation

Die Pflege der Dokumentation in Englisch und Deutsch verdoppelt die Dateianzahl und schafft eine kontinuierliche Synchronisationslast (siehe ADR-012). Typische Fehlermodi:

- Ein englischer Abschnitt wird aktualisiert, die deutsche Version jedoch nicht
- Die Übersetzung weicht in der technischen Terminologie ab (z. B. "Steering Correctness" unterschiedlich im Deutschen behandelt)
- Neue Dateien werden nur auf Englisch hinzugefügt

**Maßnahme:** Die `TRANSLATION-VERIFICATION*.md`-Scripts erkennen fehlende oder veraltete `.md`-Dateien. Beide Sprachen werden von docToolchain einheitlich gebaut -- eine fehlende DE-Datei erzeugt eine Build-Warnung.

**Verwandt:** ADR-012 (Bilingual Documentation), `08-Konzepte/04-language-and-translation.md`, `TRANSLATION-VERIFICATION.md`

### R3: Evolution der Plugin-SDK-API

Das opencode Plugin SDK wechselte zwischen den Versionen 0.58 und 0.59 von einem objektbasierten `AgentPlugin`-Interface zu einem funktionsbasierten `Plugin`-Typ (ADR-010). Weitere Änderungen sind zu erwarten, da opencode auf Version 1.0 zusteuert:

- Hook-Signaturen können sich erneut ändern
- Das Event-System, das dedizierte Hooks (`chat.message`, `agent.activate`) ersetzt, ist möglicherweise noch im Fluss
- Die Tool-Registrierung könnte vom aktuellen Objekt-Eigenschafts-Muster abweichen

**Maßnahme:** Das Plugin verwendet die aktuell dokumentierte API. Ein zukünftiger Migrationspfad für `permission.ask` ist in ADR-010 (Future Migration Path) dokumentiert. Die Testsuite (81 Tests) dient als Regression-Gate bei SDK-Updates.

**Verwandt:** ADR-010 (Function-based Plugin API), ADR-001 (tool.execute.before)

### R4: opencode-Versionsabhängigkeit

Der Enforcement-Mechanismus des Plugins basiert auf dem `tool.execute.before`-Hook, da `permission.ask` in opencode-Releases (Stand Juni 2026) instabil ist (Issues #7006, #28066). Dies schafft ein Versionskompatibilitätsrisiko:

- Wenn opencode `tool.execute.before` entfernt oder ändert, ist der Enforcement unterbrochen
- Wenn `permission.ask` stabilisiert wird, ist der Migrationspfad noch nicht implementiert

**Maßnahme:** Das Fail-Open-Design (ADR-008) stellt sicher, dass Hook-Fehler die Session nicht abstürzen lassen. Der Migrationspfad ist konzeptionell in ADR-010 dokumentiert.

**Verwandt:** ADR-001 (tool.execute.before), ADR-008 (Fail-Open), ADR-010 (Future Migration Path)

### R5: Vollständigkeit der Testabdeckung

Die Testsuite (81 Tests, 9 Testdateien) deckt die Kern-Regelengine, das Laden der Konfiguration und die Hook-Integration ab. Die Abdeckung ist jedoch nicht über alle Module einheitlich:

| Modul | Geschätzte Abdeckung | Risiko |
|-------|---------------------|--------|
| RuleEngine | >90% | Niedrig |
| ConfigLoader | >85% | Niedrig |
| Hook-Handler | >80% | Niedrig |
| Event-System-Integration | <60% | Mittel |
| Fehlerinjektion (Fail-Open) | >80% | Niedrig |
| Randfälle (fehlerhaftes YAML, Grenzwerte) | <50% | Mittel |

**Maßnahme:** Abdeckungsziele sind definiert (>80% Statements, Branches, Functions, Lines) in `10-quality-requirements.md`. TDD ist für neue Funktionen vorgeschrieben. Eine gezielte Gap-Analyse ist für die Event-System-Integrationsschicht geplant.

**Verwandt:** `10-quality-requirements.md` (8.5 Teststrategie)

### R6: Dokumentationsdrift

Während der Weiterentwicklung des Plugins kann die arc42-Dokumentation von der tatsächlichen Implementierung abweichen. Besondere Risikobereiche:

- Bausteinansichten werden nach Refactorings nicht aktualisiert
- ADRs häufen sich an, aber überholte Entscheidungen werden nicht immer aktualisiert
- Architekturbeschrankungen können sich ohne Dokumentationsaktualisierung ändern
- Der docToolchain-Build validiert die Struktur, aber nicht die semantische Korrektheit des Inhalts

**Maßnahme:** Das Single-Source-of-Truth-Prinzip (alle `.md`-Dateien in `docs/`) hält die Dokumentation nahe am Code. ADRs sind nach Annahme unveränderlich -- überholte Informationen gehen in neue ADRs oder die entsprechenden Abschnittsdateien ein. CI erzwingt keine semantische Dokumentations-Code-Übereinstimmung.

**Verwandt:** ADR-007 (Single Source of Truth Pattern), `08-Konzepte/02-update-and-maintenance.md`

### R7: Einzelentwickler (Bus-Faktor)

Das Projekt wird derzeit von einer einzelnen Person betreut. Hauptrisiken:

- Krankheit oder Verhinderung blockiert Releases und Fehlerbehebungen
- Wissen über die Architektur, CI-Pipeline und docToolchain-Konfiguration ist konzentriert
- Community-Beiträge erfordern aktive Review-Kapazitat

**Maßnahme:** Architekturentscheidungen sind in 13 ADRs dokumentiert. Die CI/CD-Pipeline automatisiert Builds, Tests und die Dokumentationsbereitstellung. Die Open-Source-Lizenz lädt zu Community-Beiträgen ein. Kritische Prozesse sind in `08-Konzepte/` dokumentiert.

## 11.4 Technische Schulden

| ID | Posten | Aufwand | Priorität | Beschreibung |
|----|--------|---------|-----------|--------------|
| TD1 | Keine dedizierte Testsuite für das Event-System | 2-3 Tage | Mittel | Die Ereignisbehandlung (`message.updated`, `session.created`) wird nur durch Integrationstests geprüft. Unit-Tests für Event-Parsing und -Routing fehlen. |
| TD2 | Keine automatisierte Übersetzungsverifikation in CI | 1-2 Tage | Mittel | TRANSLATION-VERIFICATION-Scripts existieren, sind aber nicht in CI integriert. Fehlende DE-Dateien werden nicht automatisch erkannt. |
| TD3 | docToolchain-Pipeline nicht containerisiert | 1 Tag | Niedrig | Der lokale Build erfordert Java 17 + Gradle + docToolchain-Installation. Ein Docker-Image würde die Umgebungseinrichtung eliminieren. |
| TD4 | Gap-Analyse der Abdeckung nicht automatisiert | 2-3 Tage | Niedrig | Abdeckungsberichte existieren, werden aber nicht automatisch mit Zielen verglichen. Ein CI-Schritt, der bei Abdeckung unter 80% fehlschlägt, ist noch nicht implementiert. |

## 11.5 Risikoevolution und Überprüfung

Risiken und technische Schulden werden im Rahmen des Release-Prozesses überprüft. Die folgenden Auslöser initiieren eine Neubewertung:

- opencode SDK-Versionssprung (Major oder Minor)
- Neuer Mitwirkender (reduziert Bus-Faktor)
- Testsuite-Wachstum über 150 Tests (Gap-Analyse der Abdeckung fällig)
- docToolchain-Versionsupgrade
- Stabilisierung des `permission.ask`-Hooks in opencode

---

**Source Anchor (Quelle):** arc42 Abschnitt 11 -- Risiken und technische Schulden. https://arc42.org/sections/11-risks. Die arc42-Vorlage definiert Abschnitt 11 für die Dokumentation technischer Risiken, ihrer Wahrscheinlichkeiten, Auswirkungen und Maßnahmen.
