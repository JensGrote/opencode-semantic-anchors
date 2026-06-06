# Crosscutting Concept: Installation & Usage with LLMs

## 1. Installation Methods

### Method 1: Local Plugin Install (v1 – current)

opencode supports loading plugins from the `.opencode/plugins/` directory within the user's home or project.

**Steps:**

1. **Clone or download the plugin** into `.opencode/plugins/opencode-semantic-anchors/`:
   ```bash
   git clone https://github.com/LLM-Coding/Semantic-Anchors.git
   cp -r Semantic-Anchors/plugins/opencode-semantic-anchors ~/.opencode/plugins/
   ```

2. **Install dependencies:**
   ```bash
   cd ~/.opencode/plugins/opencode-semantic-anchors && npm install
   ```

3. **Register the plugin in `~/.config/opencode/opencode.jsonc`** (or project-local `.opencode/opencode.jsonc`):
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

4. **Create configuration file** at `~/.config/opencode/opencode-semantic-anchors.yaml`:

   **Minimalkonfiguration (mit Anchor-Profilen):**
   ```yaml
   version: "1"

   # Aktivierte Anchor-Profile
   # socratic    → Intent, Negative, Verification, Source Anchors
   # architecture → Boundary, Emergence, Feedback, Resilience Anchors
   profiles:
     - socratic
     - architecture

   settings:
     maxOverrides: 3
     stepConfirmationInterval: 3
   ```

   **Mit benutzerdefinierten Contracts:**
   ```yaml
   version: "1"
   profiles:
     - socratic

   contracts:
     - id: german-response
       mode: WARN
       description: "All responses should be in German"
       triggers:
         - type: message
           pattern: ".*"
       maxOverrides: 5

   settings:
     maxOverrides: 3
     stepConfirmationInterval: 3
   ```

   **Profile-Contract überschreiben:**
   ```yaml
   version: "1"
   profiles:
     - socratic

   contracts:
     # Überschreibt das source-anchor Preset aus socratic:
     # von WARN auf BLOCK verschärft
     - id: source-anchor
       mode: BLOCK
       description: "Claims MUST cite a verifiable source URL"
       triggers:
         - type: message
           pattern: "*"
           requireSource: true
       maxOverrides: 1
   ```

5. **Restart opencode** to load the plugin.

> **Source Anchor (Quelle):** opencode Plugin Installation Guide. https://opencode.ai/docs/plugins/installation. Lokale Plugin-Installation verwendet das `.opencode/plugins/` Verzeichnis. (Stand: Juni 2026, opencode v0.59+).

### Method 2: npm Global Install (v2 – future)

Once published:
```bash
npm install -g @semantic-anchors/opencode-plugin
```

Registration in `opencode.jsonc`:
```jsonc
{
  "plugins": [
    { "name": "@semantic-anchors/opencode-plugin" }
  ]
}
```

> **Source Anchor (Quelle):** opencode plugin registry supports npm packages. https://opencode.ai/docs/plugins/npm. (Stand: Juni 2026).

## 2. Configuration File Location

The plugin searches for `opencode-semantic-anchors.yaml` in the following order (first match wins):

| Priority | Location | Use Case |
|----------|----------|----------|
| 1 | `$PROJECT_ROOT/.opencode/opencode-semantic-anchors.yaml` | Project-specific rules |
| 2 | `~/.config/opencode/opencode-semantic-anchors.yaml` | User-global defaults |
| 3 | Built-in defaults | Fallback (step-confirmation only) |

## 3. Anchor-Profile

Das Plugin verwendet ein **Profile-System**, das gebündelte Contracts pro Anchorgruppe aktiviert:

| Profil | Enthaltene Contracts | Enforcement | Beschreibung |
|--------|---------------------|-------------|--------------|
| `socratic` | `source-anchor` | 🟡 Heuristik (URL-Prüfung) | Sokratische Anker: Quellenangaben erzwingen |
| `architecture` | *(in Entwicklung)* | 🟡 Heuristik | Systemische Anker: Boundary, Emergence, Feedback |

### Enforcement vs. Prompt-Ebene

Nicht alle Semantic Anchors sind technisch durch Hooks erzwingbar. Das Plugin teilt sie in zwei Ebenen:

**🔧 Enforcement-fähig (via Plugin-Hooks):**
| Anchor | Methode |
|--------|---------|
| Step Confirmation | Tool-Call-Zähler → BLOCK |
| Source Anchor | Message-URL-Prüfung → WARN/BLOCK |
| BLUF | Message-Präfix-Check (geplant) |
| Intent / Negative / Verification | Keyword-Heuristik (geplant) |

**📝 Nur Prompt-Ebene (via AGENTS.md):**
MECE, Feynman Technique, Cynefin Framework, Boundary, Emergence, Feedback, Resilience, Stakeholder, Cognitive, Trust, Ethical

> Diese Anchors müssen in der `AGENTS.md` oder im System-Prompt des Projekts hinterlegt werden. Das Plugin kann sie nicht technisch erzwingen — die Enforcement-Profile `socratic` und `architecture` decken nur den jeweils enforcebaren Teil ab.

## 4. Verification

After installation, verify the plugin is active:

```
/anchor status
```

Expected output (with `socratic` profile active):
```
Role: default
Tool calls: 0
Overrides available: 0 / 3
Active contracts (1):
  - source-anchor [WARN] — Claims should cite a verifiable source URL (triggers: message:*)
```

## 5. Usage with LLMs

### How the LLM interacts with the plugin

The plugin operates transparently during an opencode session. The LLM does not "know" about the plugin directly — it experiences it through:

| Interaction | What happens | LLM sees |
|-------------|--------------|----------|
| **Tool call triggers a BLOCK** | Plugin returns `{ allow: false, message, overrideTool }` | opencode shows block message + `/anchor bypass` option |
| **Tool call triggers a WARN** | Plugin returns `{ allow: true, message }` | Warning message shown, tool executes |
| **User types `/anchor bypass`** | Plugin increments override count, allows next tool call | Tool executes normally |
| **User types `/anchor status`** | Plugin returns current state | Active contracts, counts, role |
| **Agent role changes** | Plugin loads role-based presets | Different set of active contracts |

### LLM-User workflow (typical session)

```
User: "Implement the login feature"
  → LLM starts working
  → After 3 tool calls: BLOCK (Step Confirmation)
  → User sees: "🚫 Step Confirmation: Already 3 tool-calls without confirmation. Continue?"
  → User: "/anchor bypass 'yes, continuing intentional work'"
  → LLM: continues

User: "Write the authentication module"
  → Before write tool: WARN (Source Anchor)
  → User sees: "⚠️ Source Anchor: No cited source found. Consider adding one."
  → User (optional): adds source reference to message
```

### Configuration via YAML

The LLM **never edits the YAML config directly** — that is the user's responsibility. The plugin is configured once and then enforces rules consistently.

### Multi-session behavior

- Session state (`toolCallCount`, `overrideCount`) resets on each opencode restart
- Role persists in `~/.config/opencode/opencode-semantic-anchors.yaml` via `defaultRole` setting
- Contracts are stable across sessions (same YAML → same enforcement)

## 6. Uninstallation

**Local install:**
```bash
rm -rf ~/.opencode/plugins/opencode-semantic-anchors
# Remove plugin entry from opencode.jsonc
```

**npm install:**
```bash
npm uninstall -g @semantic-anchors/opencode-plugin
# Remove plugin entry from opencode.jsonc
```

## 7. Dependencies

| Dependency | Version | Purpose | Risk |
|------------|---------|---------|------|
| `zod` | ^3.23 | YAML config validation | Low — stable API, widely used |
| `js-yaml` | ^4.1 | YAML parsing | Low — mature library |
| `@opencode-ai/plugin` | ^0.59 | Plugin SDK | Medium — follows opencode releases |

> **Source Anchor (Quelle):** Zod library: https://zod.dev/. js-yaml: https://github.com/nodeca/js-yaml. opencode Plugin SDK Typing: https://opencode.ai/docs/plugins/api.

## 8. Local Documentation Build

The project documentation (arc42 sections, ADRs, concepts) is maintained as Markdown (`.md`) and built into a microsite via **docToolchain + jBake**.

### Source vs. Generated Files

| Directory | Role | Contents | In git? |
|-----------|------|----------|---------|
| `docs/` | **Single source of truth** | `.md` files — edit these | ✅ committed |
| `src/docs/` | **Generated working directory** | `.md` copies + `.adoc` files + jBake build | ❌ gitignored |
| `build/` | **docToolchain output** | generated `.adoc`, microsite HTML | ❌ gitignored |

**Rule:** Edit only `.md` files in `docs/`. Everything in `src/docs/` and `build/` is regenerated on every build.

### Prerequisites

- Java 17+ (docToolchain bundles its own JDK — no manual install needed)
- docToolchain 3.5.0 (installed via `./dtcw local install doctoolchain`)
- `rsync` (usually pre-installed on Linux/macOS)

### Build Steps

Run the following from the repository root:

```bash
# 1. Sync source .md files into the working directory
rsync -a docs/ src/docs/

# 2. Convert .md → .adoc
./dtcw exportMarkdown

# 3. Copy generated .adoc files back to src/docs/
find build -name '*.adoc' | while read f; do
  rel="${f#build/}"
  mkdir -p "src/docs/$(dirname "$rel")"
  cp "$f" "src/docs/$rel"
done

# 4. Add jBake front-matter headers (type, status, menu category)
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

# 5. Remove Markdown sources (conflict with .adoc in jBake)
find src/docs -name '*.md' -delete

# 6. Generate the HTML microsite
./dtcw generateSite

# 7. Open in browser
firefox build/microsite/output/index.html
```

### What each step does

| Step | Command | Purpose |
|------|---------|---------|
| 1 | `rsync` | Copies only the `.md` source files from `docs/` into the docToolchain working directory `src/docs/` |
| 2 | `exportMarkdown` | docToolchain converts `.md` → `.adoc`, writes to `build/` |
| 3 | Copy `.adoc` | Moves generated AsciiDoc back to `src/docs/` where `generateSite` expects them |
| 4 | jBake headers | Adds `:jbake-type:`, `:jbake-status:`, `:jbake-menu:` to each `.adoc` — required for jBake site generation |
| 5 | `find ... -delete` | Removes `.md` files to prevent jBake conflicts — same-named `.md` + `.adoc` files cause jBake to skip both |
| 6 | `generateSite` | docToolchain runs jBake to produce HTML in `build/microsite/output/` |
| 7 | Open browser | View the result locally |

### Why not just run `./dtcw generateSite`?

`generateSite` reads `.adoc` files from `src/docs/`. If you skip steps 1-5, it will either:
- **Fail** if `src/docs/` is empty (fresh clone, gitignored directory)
- **Produce stale output** if `src/docs/` contains `.adoc` from a previous build that is out of sync with the current `.md` sources
- **Miss arc42 pages** if `.md` files are still present in `src/docs/` (jBake prioritises `.md` over `.adoc` for same-named files)

Always run the full pipeline.

### GitHub Actions (CI)

The same pipeline runs automatically in `.github/workflows/deploy-docs.yml` on every push to `main` that touches files under `docs/`. The CI workflow mirrors steps 1-6 exactly, then uploads `build/microsite/output/` as a Pages artifact and deploys to GitHub Pages.

> **Source Anchor:** docToolchain exportMarkdown task: https://doctoolchain.org/tasks/exportMarkdown.html. docToolchain generateSite task: https://doctoolchain.org/tasks/generateSite.html. jBake: https://jbake.org. GitHub Pages: https://pages.github.com/.
