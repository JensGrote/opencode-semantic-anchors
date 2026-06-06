# Querschnittskonzept: Installation & Nutzung mit LLMs

## 1. Installationsmethoden

### Methode 1: Lokale Plugin-Installation (v1 – aktuell)

opencode unterstützt das Laden von Plugins aus dem `.opencode/plugins/`-Verzeichnis im Home-Verzeichnis oder Projekt des Benutzers.

**Schritte:**

1. **Plugin klonen oder herunterladen** nach `.opencode/plugins/opencode-semantic-anchors/`:
   ```bash
   git clone https://github.com/LLM-Coding/Semantic-Anchors.git
   cp -r Semantic-Anchors/plugins/opencode-semantic-anchors ~/.opencode/plugins/
   ```

2. **Abhängigkeiten installieren:**
   ```bash
   cd ~/.opencode/plugins/opencode-semantic-anchors && npm install
   ```

3. **Plugin in `~/.config/opencode/opencode.jsonc` registrieren** (oder projekt-lokal `.opencode/opencode.jsonc`):
   ```jsonc
   {
     "plugins": [
       {
         "name": "opencode-semantic-anchors",
         "path": "~/.opencode/plugins/opencode-semantic-anchors"
       }
     ]
   }
   ```

4. **Konfigurationsdatei erstellen** unter `~/.config/opencode/opencode-semantic-anchors.yaml`:
   ```yaml
   version: "1"
   contracts:
     - id: step-confirmation
       mode: BLOCK
       description: "Requires explicit 'Weiter?' confirmation every N tool calls"
       anchorRefs: ["step-confirmation-anchor"]
       triggers:
         - type: tool
           pattern: "*"
           count: 3
       maxOverrides: 3
   presets:
     software-developer:
       - step-confirmation
   settings:
     maxOverrides: 3
     stepConfirmationInterval: 3
   ```

   > **Hinweis:** `anchorRefs` ist optional. Contracts können auch **ohne** Semantic-Anchor-Referenz existieren — z. B. für projektspezifische Steering-Regeln:

   ```yaml
   contracts:
     - id: german-response
       mode: WARN
       description: "All responses should be in German"
       # kein anchorRefs — eigenständige Steering-Regel
       triggers:
         - type: message
           pattern: ".*"
       maxOverrides: 5

     - id: mece-structure
       mode: WARN
       description: "Structured arguments using MECE principle"
       triggers:
         - type: message
           pattern: "weil|deshalb|daher"
       maxOverrides: 3
   ```

5. **opencode neu starten**, um das Plugin zu laden.

> **Source Anchor (Quelle):** opencode Plugin Installation Guide. https://opencode.ai/docs/plugins/installation. Lokale Plugin-Installation verwendet das `.opencode/plugins/`-Verzeichnis. (Stand: Juni 2026, opencode v0.59+).

### Methode 2: npm Globale Installation (v2 – zukünftig)

Sobald veröffentlicht:
```bash
npm install -g @semantic-anchors/opencode-plugin
```

Registrierung in `opencode.jsonc`:
```jsonc
{
  "plugins": [
    { "name": "@semantic-anchors/opencode-plugin" }
  ]
}
```

> **Source Anchor (Quelle):** opencode plugin registry supports npm packages. https://opencode.ai/docs/plugins/npm. (Stand: Juni 2026).

## 2. Speicherort der Konfigurationsdatei

Das Plugin sucht nach `opencode-semantic-anchors.yaml` in der folgenden Reihenfolge (erster Treffer gewinnt):

| Priorität | Pfad | Anwendungsfall |
|-----------|------|---------------|
| 1 | `$PROJECT_ROOT/.opencode/opencode-semantic-anchors.yaml` | Projektspezifische Regeln |
| 2 | `~/.config/opencode/opencode-semantic-anchors.yaml` | Benutzerglobale Defaults |
| 3 | Built-in Defaults | Fallback (nur Step-Confirmation) |

## 3. Verifikation

Nach der Installation überprüfen, ob das Plugin aktiv ist:

```
/anchor status
```

Erwartete Ausgabe:
```
Plugin: opencode-semantic-anchors v0.1.0
Role: software-developer
Active Contracts: [step-confirmation]
Tool Calls: 0 | Overrides: 0/3
Status: ✅ Active
```

## 4. Nutzung mit LLMs

### Wie das LLM mit dem Plugin interagiert

Das Plugin arbeitet während einer opencode-Session transparent. Das LLM „weiß" nicht direkt vom Plugin — es erfährt davon durch:

| Interaktion | Was passiert | LLM sieht |
|-------------|-------------|-----------|
| **Tool-Aufruf löst BLOCK aus** | Plugin gibt `{ allow: false, message, overrideTool }` zurück | opencode zeigt Block-Meldung + `/anchor bypass` Option |
| **Tool-Aufruf löst WARN aus** | Plugin gibt `{ allow: true, message }` zurück | Warnmeldung wird angezeigt, Tool wird ausgeführt |
| **Benutzer gibt `/anchor bypass` ein** | Plugin erhöht Override-Zähler, erlaubt nächsten Tool-Aufruf | Tool wird normal ausgeführt |
| **Benutzer gibt `/anchor status` ein** | Plugin gibt aktuellen Zustand zurück | Aktive Contracts, Zähler, Rolle |
| **Agentenrolle wechselt** | Plugin lädt rollenbasierte Presets | Anderer Satz aktiver Contracts |

### LLM-Benutzer-Workflow (typische Session)

```
User: "Implement the login feature"
  → LLM beginnt mit der Arbeit
  → Nach 3 Tool-Aufrufen: BLOCK (Step Confirmation)
  → Benutzer sieht: "🚫 Step Confirmation: Already 3 tool-calls without confirmation. Continue?"
  → Benutzer: "/anchor bypass 'yes, continuing intentional work'"
  → LLM: fährt fort

User: "Write the authentication module"
  → Vor write-Tool: WARN (Source Anchor)
  → Benutzer sieht: "⚠️ Source Anchor: No cited source found. Consider adding one."
  → Benutzer (optional): fügt Quellenangabe zur Nachricht hinzu
```

### Konfiguration via YAML

Das LLM **bearbeitet die YAML-Config nie direkt** — das ist die Verantwortung des Benutzers. Das Plugin wird einmal konfiguriert und setzt dann Regeln konsistent durch.

### Mehrfach-Session-Verhalten

- Session-State (`toolCallCount`, `overrideCount`) wird bei jedem opencode-Neustart zurückgesetzt
- Rolle bleibt in `~/.config/opencode/opencode-semantic-anchors.yaml` über die `defaultRole`-Einstellung erhalten
- Contracts sind sessionübergreifend stabil (gleiches YAML → gleiche Durchsetzung)

## 5. Deinstallation

**Lokale Installation:**
```bash
rm -rf ~/.opencode/plugins/opencode-semantic-anchors
# Plugin-Eintrag aus opencode.jsonc entfernen
```

**npm-Installation:**
```bash
npm uninstall -g @semantic-anchors/opencode-plugin
# Plugin-Eintrag aus opencode.jsonc entfernen
```

## 6. Abhängigkeiten

| Abhängigkeit | Version | Zweck | Risiko |
|-------------|---------|-------|--------|
| `zod` | ^3.23 | YAML-Config-Validierung | Niedrig — stabile API, weit verbreitet |
| `js-yaml` | ^4.1 | YAML-Parsing | Niedrig — ausgereifte Bibliothek |
| `@opencode-ai/plugin` | ^0.59 | Plugin SDK | Mittel — folgt opencode-Releases |

> **Source Anchor (Quelle):** Zod library: https://zod.dev/. js-yaml: https://github.com/nodeca/js-yaml. opencode Plugin SDK Typing: https://opencode.ai/docs/plugins/api.

## 7. Lokaler Dokumentations-Build

Die Projektdokumentation (arc42-Sektionen, ADRs, Concepts) wird in Markdown (`.md`) gepflegt und mittels **docToolchain + jBake** in eine Microsite gebaut.

### Quell- vs. generierte Dateien

| Verzeichnis | Rolle | Inhalt | In git? |
|-------------|-------|--------|---------|
| `docs/` | **Single source of truth** | `.md`-Dateien — hier editieren | ✅ committed |
| `src/docs/` | **Generiertes Arbeitsverzeichnis** | `.md`-Kopien + `.adoc`-Dateien + jBake-Build | ❌ gitignored |
| `build/` | **docToolchain-Ausgabe** | generierte `.adoc`, Microsite-HTML | ❌ gitignored |

**Regel:** Nur `.md`-Dateien in `docs/` editieren. Alles in `src/docs/` und `build/` wird bei jedem Build neu generiert.

### Voraussetzungen

- Java 17+ (docToolchain bündelt eigene JDK — keine manuelle Installation nötig)
- docToolchain 3.5.0 (installiert via `./dtcw local install doctoolchain`)
- `rsync` (normalerweise auf Linux/macOS vorinstalliert)

### Build-Schritte

Ausgeführt vom Repository-Root:

```bash
# 1. .md-Quelldateien ins Arbeitsverzeichnis synchronisieren
rsync -a docs/ src/docs/

# 2. .md → .adoc konvertieren
./dtcw exportMarkdown

# 3. Generierte .adoc-Dateien zurück nach src/docs/ kopieren
find build -name '*.adoc' | while read f; do
  rel="${f#build/}"
  mkdir -p "src/docs/$(dirname "$rel")"
  cp "$f" "src/docs/$rel"
done

# 4. jBake-Frontmatter-Header hinzufügen (Typ, Status, Menü-Kategorie)
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

### Was jeder Schritt bewirkt

| Schritt | Befehl | Zweck |
|---------|--------|-------|
| 1 | `rsync` | Kopiert nur die `.md`-Quelldateien aus `docs/` in das docToolchain-Arbeitsverzeichnis `src/docs/` |
| 2 | `exportMarkdown` | docToolchain konvertiert `.md` → `.adoc`, schreibt nach `build/` |
| 3 | `.adoc` kopieren | Verschiebt generiertes AsciiDoc zurück nach `src/docs/`, wo `generateSite` sie erwartet |
| 4 | jBake-Header | Fügt `:jbake-type:`, `:jbake-status:`, `:jbake-menu:` zu jeder `.adoc` hinzu — erforderlich für jBake-Seitengenerierung |
| 5 | `find ... -delete` | Entfernt `.md`-Dateien, um jBake-Konflikte zu vermeiden — gleichnamige `.md` + `.adoc` führen dazu, dass jBake beide überspringt |
| 6 | `generateSite` | docToolchain führt jBake aus, um HTML in `build/microsite/output/` zu erzeugen |
| 7 | Browser öffnen | Ergebnis lokal ansehen |

### Warum nicht einfach `./dtcw generateSite`?

`generateSite` liest `.adoc`-Dateien aus `src/docs/`. Wenn die Schritte 1-5 übersprungen werden, passiert entweder:
- **Fehler** wenn `src/docs/` leer ist (frischer Clone, gitignored)
- **Veraltete Ausgabe** wenn `src/docs/` `.adoc`-Dateien eines früheren Builds enthält, die nicht mehr mit den aktuellen `.md`-Quellen synchron sind
- **Fehlende arc42-Seiten** wenn `.md`-Dateien noch in `src/docs/` vorhanden sind (jBake priorisiert `.md` gegenüber `.adoc` bei gleichnamigen Dateien)

Immer die vollständige Pipeline ausführen.

### GitHub Actions (CI)

Dieselbe Pipeline läuft automatisch in `.github/workflows/deploy-docs.yml` bei jedem Push auf `main`, der Dateien unter `docs/` betrifft. Der CI-Workflow spiegelt die Schritte 1-6 exakt wider, lädt dann `build/microsite/output/` als Pages-Artefakt hoch und deployed auf GitHub Pages.

> **Source Anchor:** docToolchain exportMarkdown task: https://doctoolchain.org/tasks/exportMarkdown.html. docToolchain generateSite task: https://doctoolchain.org/tasks/generateSite.html. jBake: https://jbake.org. GitHub Pages: https://pages.github.com/.
