# ADR-007: Markdown for Design Docs, .adoc via docToolchain Pipeline

## Status
Accepted (Updated 2026-06-05)

## Context
The LLM-Coding/Semantic-Anchors Repository mandates **AsciiDoc (`.adoc`)** as its binding format:

> "AsciiDoc is mandatory — Do not convert to Markdown"
> — *CLAUDE.md, LLM-Coding/Semantic-Anchors Repository*

Our plugin design documentation follows the arc42 template. Initially, a single `opencode-semantic-anchors-design.adoc` was maintained as a "master copy", but this duplicated effort and was difficult to keep synchronised with the arc42 section files.

Two developments changed the approach:

1. **Decomposition:** The monolithic design doc was fully decomposed into individual arc42 section files (01-introduction-and-goals.md through 12-glossary.md), plus 08-concepts/ and 09-ADRs/ directories (arc42 sections 8 and 9). The original `.adoc` master copy was deleted.

2. **docToolchain Pipeline:** We adopted docToolchain 3.5.0 as a local build framework that automates the `.md → .adoc` conversion via `exportMarkdown` and generates a microsite via `generateSite` (jBake), deployed to GitHub Pages.

The question: Should we write the design docs in AsciiDoc from the start (compatible with the contribution target), or in Markdown (more efficient for local development) and convert automatically via docToolchain?

## Alternatives Considered

### Option A: AsciiDoc from the Start
The entire design document is written directly in `.adoc`.

**Advantages:**
- No conversion needed at contribution time
- 1:1 compatible with Semantic-Anchors repo
- No "loss" through format translation
- Early familiarisation with AsciiDoc syntax

**Disadvantages:**
- **Higher cognitive load** — AsciiDoc is less known than Markdown
- **Less tool support** — no native support in many editors/viewers
- **arc42 tooling** is designed for Markdown, not AsciiDoc
- AsciiDoc compiler (`asciidoctor`) must be installed locally
- Preview/IDE support for AsciiDoc is worse than for Markdown
- **Poorer diff readability** — AsciiDoc has more syntactic noise

### Option B: Markdown + docToolchain Pipeline (chosen)
The design document is written locally in `.md`. A docToolchain build step (`exportMarkdown`) converts `.md` → `.adoc` automatically. A second step (`generateSite`) produces HTML via jBake for the microsite on GitHub Pages.

**Advantages:**
- **Lower cognitive load** during the design phase
- **Better diff readability** — Markdown is leaner
- Excellent tool support (preview, linting, editors)
- arc42 is natively Markdown-compatible
- **Automated conversion** — no manual rework at contribution time
- **Single source of truth** — `.md` files are the primary format; `.adoc` is generated
- **Continuous deployment** — GitHub Actions runs the pipeline on every push
- **Bilingual support** — `.de.md` files are converted alongside `.md` files

**Disadvantages:**
- **Build dependency** — docToolchain (Java 17, Gradle) must be available locally
- **Generated `.adoc` files** — must not be edited directly (changes would be overwritten)
- **Medium learning curve** — docToolchain configuration (Groovy DSL) is non-trivial

### Option C: Markdown with AsciiDoc-Compatible Subset
Write in Markdown, but only use features that have a 1:1 mapping to AsciiDoc.

**Disadvantages:**
- **Restricts Markdown usage** — no tables, no Mermaid, no strict Markdown standard
- Hard to enforce (no linter checks for "AsciiDoc-compatible Markdown")
- Increases cognitive load (must constantly think about the target format)
- Conversion still needed — effort remains

## Evaluation Criteria
| Criterion | Weight | Description |
|-----------|--------|-------------|
| Development speed | High | Design phase should not be slowed down by format choice |
| Diff readability | High | Code reviews and change tracking |
| Contribution readiness | Medium | Must end up in Semantic-Anchors repo (.adoc) |
| Tool support | Medium | IDE preview, linting, arc42 templates |
| Automation | High | Conversion should be automated, not manual |
| Deployment | Medium | Documentation must be published as a microsite |

## Decision
**Option B: Markdown + docToolchain Pipeline** was chosen.

Rationale:
- Design phase benefits from Markdown's simplicity and tool support
- docToolchain's `exportMarkdown` task automates `.md → .adoc` conversion — no manual rework
- The original master copy (`opencode-semantic-anchors-design.adoc`) was deleted after its content was fully migrated to the arc42 section files
- The `.adoc` files are now **generated artifacts**, not sources — they are excluded from git and produced at build time
- The GitHub Actions workflow (`deploy-docs.yml`) runs the full pipeline on every push and deploys to GitHub Pages

### Single Source of Truth Pattern

A two-directory layout separates source from build artifacts:

| Directory | Role | Contents | In git? |
|-----------|------|----------|---------|
| `docs/` | **Single source of truth** | `.md` files (arc42 sections, concepts, ADRs) | ✅ committed |
| `src/docs/` | **Generated working directory** | `.md` copies, `.adoc` files, jBake build | ❌ gitignored |
| `build/` | **docToolchain output** | generated `.adoc` (from `exportMarkdown`), microsite HTML (from `generateSite`) | ❌ gitignored |

### Local Build Pipeline

To build the documentation site locally:

```bash
# 1. Sync the source .md files into the working directory
rsync -a docs/ src/docs/

# 2. Convert .md → .adoc via docToolchain
./dtcw exportMarkdown

# 3. Copy generated .adoc files back into src/docs/
find build -name '*.adoc' | while read f; do
  rel="${f#build/}"
  mkdir -p "src/docs/$(dirname "$rel")"
  cp "$f" "src/docs/$rel"
done

# 4. Add jBake front-matter headers to each .adoc file
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

**Why the copy+headers step is necessary:**
- `exportMarkdown` writes `.adoc` files to `build/`, not to `src/docs/`
- `generateSite` reads `.adoc` files from `src/docs/` (as configured in `docToolchainConfig.groovy`: `inputPath = 'src/docs'`)
- jBake requires specific front-matter (`:jbake-type:`, `:jbake-status:`, `:jbake-menu:`) to correctly classify and publish pages — docToolchain's `exportMarkdown` does not add these headers automatically

**Why the .md removal step is necessary:**
- When `.md` and `.adoc` files with the same base name (e.g. `01-introduction-and-goals.md` + `.adoc`) exist in the same directory, jBake gives precedence to the `.md` version
- Since `.md` files lack jBake headers, they are skipped silently — and their `.adoc` counterparts are also not rendered
- Removing `.md` files before `generateSite` ensures jBake processes only the `.adoc` files, which have the correct headers

### GitHub Actions Pipeline

The CI workflow in `.github/workflows/deploy-docs.yml` mirrors the local pipeline exactly:

1. `actions/checkout@v4` — fetches the repository (including `docs/` with all `.md` files)
2. Setup Java 17 (Temurin) + docToolchain 3.5.0
3. **`rsync -a docs/ src/docs/`** — syncs source `.md` files into the working directory
4. **`./dtcw exportMarkdown`** — converts `.md → .adoc` to `build/`
5. **Copy + jBake headers** — copies `.adoc` back to `src/docs/` and adds front-matter
6. **Remove .md files** — deletes `.md` files from `src/docs/` to avoid jBake conflicts
7. **`./dtcw generateSite`** — generates HTML microsite in `build/microsite/output/`
8. `actions/upload-pages-artifact@v3` + `actions/deploy-pages@v4` — publishes to GitHub Pages

**Trigger:** The workflow runs on pushes to `main` that change files under `docs/**`, `docToolchainConfig.groovy`, or the workflow file itself. It can also be triggered manually via `workflow_dispatch`.

## Consequences
- **Positive:** Faster design phase through familiar Markdown
- **Positive:** arc42 tooling works natively with Markdown
- **Positive:** Better diff readability for code reviews
- **Positive:** Automated `.md → .adoc` conversion — no synchronisation effort
- **Positive:** Continuous deployment via GitHub Actions (push → publish)
- **Positive:** Clear separation of source (`docs/`) and generated artifacts (`src/docs/` + `build/`)
- **Positive:** Git history stays clean — only `.md` files change, generated `.adoc` and HTML are excluded
- **Negative:** Build dependency on Java 17 + docToolchain 3.5.0
- **Negative:** Multi-step pipeline (exportMarkdown → copy+headers → remove .md → generateSite) is non-obvious — must be documented
- **Negative:** Local build requires the full 7-step pipeline; a single `./dtcw generateSite` without the prior steps produces stale output
- **Negative:** Mermaid diagrams may need to be converted to PlantUML if contributing upstream
- **Trade-off:** Automation overhead (pipeline config) vs. manual conversion effort

## Related
- Decision 6 in 04-solution-strategy.md
- 02-architecture-constraints.md (Process Constraints)
- `docToolchainConfig.groovy` (pipeline configuration)
- `.github/workflows/deploy-docs.yml` (GitHub Actions deployment)
- docs/08-concepts/01-installation.md (§8 Local Documentation Build — step-by-step guide)
- docs/08-concepts/02-update-and-maintenance.md (§4 CI/CD Pipeline — docToolchain stage)
- ADR-012: Bilingual Documentation
- ADR-013: Design-Time Bundling (also uses docToolchain for docs)

## Sources
- LLM-Coding/Semantic-Anchors — CLAUDE.md: "AsciiDoc is mandatory — Do not convert to Markdown." https://github.com/LLM-Coding/Semantic-Anchors/blob/main/CLAUDE.md
- arc42 Template (Markdown): https://github.com/arc42/arc42-template
- docToolchain: https://doctoolchain.org
- docToolchain exportMarkdown task: https://doctoolchain.org/tasks/exportMarkdown.html
- jBake: https://jbake.org
