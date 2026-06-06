# ADR-007: Markdown für Design-Dokumente, .adoc via docToolchain-Pipeline

## Status
Accepted (Aktualisiert 2026-06-05)

## Context
Das LLM-Coding/Semantic-Anchors-Repository schreibt **AsciiDoc (`.adoc`)** als verbindliches Format vor:

> "AsciiDoc is mandatory — Do not convert to Markdown"
> — *CLAUDE.md, LLM-Coding/Semantic-Anchors-Repository*

Unsere Plugin-Design-Dokumentation folgt der arc42-Vorlage. Zunächst wurde eine einzelne `opencode-semantic-anchors-design.adoc` als "Master-Kopie" geführt, aber dies verdoppelte den Aufwand und war schwer mit den arc42-Sektionsdateien synchron zu halten.

Zwei Entwicklungen änderten den Ansatz:

1. **Dekomposition:** Das monolithische Design-Dokument wurde vollständig in einzelne arc42-Sektionsdateien (01-introduction-and-goals.md bis 09-glossary.md) plus concepts/- und decisions/-Verzeichnisse aufgelöst. Die originale `.adoc`-Master-Kopie wurde gelöscht.

2. **docToolchain-Pipeline:** Wir haben docToolchain 3.5.0 als lokales Build-Framework eingeführt, das die `.md → .adoc`-Konvertierung via `exportMarkdown` automatisiert und eine Microsite via `generateSite` (jBake) erzeugt, die auf GitHub Pages deployed wird.

Die Frage: Sollen wir die Design-Dokumente von Anfang an in AsciiDoc schreiben (kompatibel mit dem Contribution-Ziel) oder in Markdown (effizienter für die lokale Entwicklung) und automatisch via docToolchain konvertieren?

## Alternatives Considered

### Option A: AsciiDoc von Anfang an
Das gesamte Design-Dokument wird direkt in `.adoc` geschrieben.

**Vorteile:**
- Keine Konvertierung bei Contribution nötig
- 1:1 kompatibel mit Semantic-Anchors-Repo
- Keine "Verluste" durch Format-Übersetzung
- Frühe Einarbeitung in AsciiDoc-Syntax

**Nachteile:**
- **Höhere kognitive Last** — AsciiDoc ist weniger bekannt als Markdown
- **Weniger Tool-Unterstützung** — keine native Unterstützung in vielen Editoren/Viewern
- **arc42-Tooling** ist für Markdown ausgelegt, nicht für AsciiDoc
- AsciiDoc-Compiler (`asciidoctor`) muss lokal installiert sein
- Preview/IDE-Unterstützung für AsciiDoc ist schlechter als für Markdown
- **Schlechtere Diff-Lesbarkeit** — AsciiDoc hat mehr syntaktisches Rauschen

### Option B: Markdown + docToolchain-Pipeline (gewählt)
Das Design-Dokument wird lokal in `.md` geschrieben. Ein docToolchain-Build-Schritt (`exportMarkdown`) konvertiert `.md` → `.adoc` automatisch. Ein zweiter Schritt (`generateSite`) erzeugt HTML via jBake für die Microsite auf GitHub Pages.

**Vorteile:**
- **Geringere kognitive Last** während der Design-Phase
- **Bessere Diff-Lesbarkeit** — Markdown ist schlanker
- Exzellente Tool-Unterstützung (Preview, Linting, Editoren)
- arc42 ist nativ Markdown-kompatibel
- **Automatisierte Konvertierung** — keine manuelle Nacharbeit bei Contribution
- **Single Source of Truth** — `.md`-Dateien sind das Primärformat; `.adoc` wird generiert
- **Continuous Deployment** — GitHub Actions führt die Pipeline bei jedem Push aus
- **Zweisprachige Unterstützung** — `.de.md`-Dateien werden parallel konvertiert

**Nachteile:**
- **Build-Abhängigkeit** — docToolchain (Java 17, Gradle) muss lokal verfügbar sein
- **Generierte `.adoc`-Dateien** — dürfen nicht direkt editiert werden (Änderungen würden überschrieben)
- **Mittlere Lernkurve** — docToolchain-Konfiguration (Groovy-DSL) ist nicht trivial

### Option C: Markdown mit AsciiDoc-kompatibler Teilmenge
In Markdown schreiben, aber nur Features nutzen, die eine 1:1-Entsprechung in AsciiDoc haben.

**Nachteile:**
- **Schränkt Markdown-Nutzung ein** — keine Tabellen, kein Mermaid, kein strikter Markdown-Standard
- Schwer durchsetzbar (kein Linter für "AsciiDoc-kompatibles Markdown")
- Erhöht kognitive Last (ständiges Denken an das Zielformat)
- Konvertierung immer noch nötig — Aufwand bleibt

## Evaluation Criteria
| Kriterium | Gewicht | Beschreibung |
|-----------|---------|-------------|
| Entwicklungsgeschwindigkeit | Hoch | Design-Phase soll nicht durch Formatwahl verlangsamt werden |
| Diff-Lesbarkeit | Hoch | Code-Reviews und Änderungsverfolgung |
| Contribution-Bereitschaft | Mittel | Muss im Semantic-Anchors-Repo (.adoc) enden |
| Tool-Unterstützung | Mittel | IDE-Preview, Linting, arc42-Vorlagen |
| Automatisierung | Hoch | Konvertierung soll automatisiert sein, nicht manuell |
| Deployment | Mittel | Dokumentation muss als Microsite publiziert werden |

## Decision
**Option B: Markdown + docToolchain-Pipeline** wurde gewählt.

Begründung:
- Design-Phase profitiert von Markdowns Einfachheit und Tool-Unterstützung
- docToolchains `exportMarkdown`-Task automatisiert die `.md → .adoc`-Konvertierung — keine manuelle Nacharbeit
- Die originale Master-Kopie (`opencode-semantic-anchors-design.adoc`) wurde gelöscht, nachdem ihr Inhalt vollständig in die arc42-Sektionsdateien migriert wurde
- Die `.adoc`-Dateien sind jetzt **generierte Artefakte**, keine Quellen — sie sind von git ausgeschlossen und werden zur Build-Zeit erzeugt
- Der GitHub-Actions-Workflow (`deploy-docs.yml`) führt die vollständige Pipeline bei jedem Push aus und deployed auf GitHub Pages

### Single Source of Truth Pattern

Ein Zwei-Verzeichnis-Layout trennt Quellen von Build-Artefakten:

| Verzeichnis | Rolle | Inhalt | In git? |
|-------------|-------|--------|---------|
| `docs/` | **Single source of truth** | `.md`-Dateien (arc42-Sektionen, Concepts, ADRs) | ✅ committed |
| `src/docs/` | **Generiertes Arbeitsverzeichnis** | `.md`-Kopien, `.adoc`-Dateien, jBake-Build | ❌ gitignored |
| `build/` | **docToolchain-Ausgabe** | generierte `.adoc` (aus `exportMarkdown`), Microsite-HTML (aus `generateSite`) | ❌ gitignored |

### Lokale Build-Pipeline

So wird die Dokumentations-Seite lokal gebaut:

```bash
# 1. .md-Quelldateien ins Arbeitsverzeichnis synchronisieren
rsync -a docs/ src/docs/

# 2. .md → .adoc via docToolchain konvertieren
./dtcw exportMarkdown

# 3. Generierte .adoc-Dateien zurück nach src/docs/ kopieren
find build -name '*.adoc' | while read f; do
  rel="${f#build/}"
  mkdir -p "src/docs/$(dirname "$rel")"
  cp "$f" "src/docs/$rel"
done

# 4. jBake-Frontmatter-Header zu jeder .adoc-Datei hinzufügen
find src/docs -name '*.adoc' | while read file; do
  if ! grep -q 'jbake-type' "$file"; then
    read -r first_line < "$file"
    case "$(dirname "${file#src/docs/}")" in
      concepts*)   menu="concepts" ;;
      decisions*)  menu="decisions" ;;
      *)           menu="arc42" ;;
    esac
    {
      echo "$first_line"
      echo ":jbake-type: page"
      echo ":jbake-status: published"
      echo ":jbake-menu: $menu"
      echo ""
      tail -n +2 "$file"
    } > "${file}.tmp" && mv "${file}.tmp" "$file"
  fi
done

# 5. Markdown-Quellen entfernen (Konflikt mit .adoc in jBake)
find src/docs -name '*.md' -delete

# 6. HTML-Microsite generieren
./dtcw generateSite

# 7. Im Browser öffnen
firefox build/microsite/output/index.html
```

**Warum der Copy+Headers-Schritt nötig ist:**
- `exportMarkdown` schreibt `.adoc`-Dateien nach `build/`, nicht nach `src/docs/`
- `generateSite` liest `.adoc`-Dateien aus `src/docs/` (wie in `docToolchainConfig.groovy` konfiguriert: `inputPath = 'src/docs'`)
- jBake benötigt bestimmte Frontmatter-Header (`:jbake-type:`, `:jbake-status:`, `:jbake-menu:`), um Seiten korrekt zu klassifizieren und zu publizieren — docToolchains `exportMarkdown` fügt diese Header nicht automatisch hinzu

**Warum der .md-Entfernungs-Schritt nötig ist:**
- Wenn `.md`- und `.adoc`-Dateien mit dem gleichen Basisnamen (z. B. `01-introduction-and-goals.md` + `.adoc`) im selben Verzeichnis liegen, priorisiert jBake die `.md`-Version
- Da `.md`-Dateien keine jBake-Header haben, werden sie stillschweigend übersprungen — und ihre `.adoc`-Gegenstücke werden ebenfalls nicht gerendert
- Das Entfernen der `.md`-Dateien vor `generateSite` stellt sicher, dass jBake nur die `.adoc`-Dateien verarbeitet, die die korrekten Header besitzen

### GitHub-Actions-Pipeline

Der CI-Workflow in `.github/workflows/deploy-docs.yml` spiegelt die lokale Pipeline exakt wider:

1. `actions/checkout@v4` — Repository abrufen (inklusive `docs/` mit allen `.md`-Dateien)
2. Java 17 (Temurin) + docToolchain 3.5.0 einrichten
3. **`rsync -a docs/ src/docs/`** — .md-Quellen ins Arbeitsverzeichnis synchronisieren
4. **`./dtcw exportMarkdown`** — `.md → .adoc` nach `build/` konvertieren
5. **Copy + jBake-Header** — `.adoc` zurück nach `src/docs/` kopieren und Frontmatter hinzufügen
6. **.md-Dateien entfernen** — löscht `.md`-Dateien aus `src/docs/` um jBake-Konflikte zu vermeiden
7. **`./dtcw generateSite`** — HTML-Microsite in `build/microsite/output/` generieren
8. `actions/upload-pages-artifact@v3` + `actions/deploy-pages@v4` — auf GitHub Pages publizieren

**Trigger:** Der Workflow läuft bei Pushes auf `main`, die Dateien unter `docs/**`, `docToolchainConfig.groovy` oder die Workflow-Datei selbst ändern. Manueller Start via `workflow_dispatch` ist ebenfalls möglich.

## Consequences
- **Positiv:** Schnellere Design-Phase durch vertrautes Markdown
- **Positiv:** arc42-Tooling funktioniert nativ mit Markdown
- **Positiv:** Bessere Diff-Lesbarkeit für Code-Reviews
- **Positiv:** Automatisierte `.md → .adoc`-Konvertierung — kein Synchronisationsaufwand
- **Positiv:** Continuous Deployment via GitHub Actions (Push → Publikation)
- **Positiv:** Klare Trennung von Quellen (`docs/`) und generierten Artefakten (`src/docs/` + `build/`)
- **Positiv:** Git-History bleibt sauber — nur `.md`-Dateien ändern sich, generierte `.adoc` und HTML sind ausgeschlossen
- **Negativ:** Build-Abhängigkeit von Java 17 + docToolchain 3.5.0
- **Negativ:** Mehrstufige Pipeline (exportMarkdown → copy+headers → .md entfernen → generateSite) ist nicht offensichtlich — muss dokumentiert sein
- **Negativ:** Lokaler Build erfordert die vollständige 7-Schritt-Pipeline; ein einzelnes `./dtcw generateSite` ohne vorherige Schritte produziert veraltete Ausgabe
- **Negativ:** Mermaid-Diagramme müssen ggf. in PlantUML konvertiert werden (bei Contribution upstream)
- **Trade-off:** Automatisierungs-Overhead (Pipeline-Konfiguration) vs. manueller Konvertierungsaufwand

## Related
- Decision 6 in 04-solution-strategy.md
- 02-architecture-constraints.md (Process Constraints)
- `docToolchainConfig.groovy` (Pipeline-Konfiguration)
- `.github/workflows/deploy-docs.yml` (GitHub Actions Deployment)
- docs/concepts/01-installation.md (§8 Local Documentation Build — Schritt-für-Schritt-Anleitung)
- docs/concepts/02-update-and-maintenance.md (§4 CI/CD Pipeline — docToolchain-Stufe)
- ADR-012: Bilingual Documentation
- ADR-013: Design-Time Bundling (nutzt ebenfalls docToolchain für Docs)

## Sources
- LLM-Coding/Semantic-Anchors — CLAUDE.md: "AsciiDoc is mandatory — Do not convert to Markdown." https://github.com/LLM-Coding/Semantic-Anchors/blob/main/CLAUDE.md
- arc42 Template (Markdown): https://github.com/arc42/arc42-template
- docToolchain: https://doctoolchain.org
- docToolchain exportMarkdown Task: https://doctoolchain.org/tasks/exportMarkdown.html
- jBake: https://jbake.org
