# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Slidev addon that enables displaying DMN (Decision Model and Notation) diagrams in presentations. It uses dmn-js to render DMN XML files as SVG elements and HTML tables within Vue components.

## Development Commands

```bash
# Run the example presentation in dev mode (via portless — stable .localhost URL)
npm run dev

# Run the Slidev dev server directly, without portless
npm run dev:app

# Build the example presentation
npm run build

# Export presentation to PDF
npm run export

# Export presentation to PNG screenshots
npm run screenshot
```

### Dev server URLs (portless)

`npm run dev` runs the Slidev server behind [portless](https://portless.sh), which is a
pinned **devDependency** (no global install needed). portless replaces the dev port with a
stable, git-worktree-aware URL: in the main checkout it serves
`https://slidev-addon-dmn.localhost`, and in a linked git worktree it auto-derives
`https://<worktree>.slidev-addon-dmn.localhost`. The slug is portless-derived — never
hand-build it.

Config lives in `portless.json` (`{ "name": "slidev-addon-dmn", "script": "dev:app" }`): `dev`
is just the portless entrypoint, and the real Slidev command lives in `dev:app` so non-portless
users can run the server directly. portless sets `$PORT`; Slidev binds to IPv4 via
`--remote --bind 127.0.0.1` (its `localhost` default resolves to IPv6 `::1`, which portless
can't proxy on macOS).

**One-time per machine:** install the proxy daemon so it survives reboots (needs sudo once):

```bash
npx portless service install
```

## Architecture

### Core Components

The addon consists of three Vue components, backed by shared helpers in `composables/`
(`useDmn.ts` — fetch + loading/error state), `internal/` (`ToolbarButton.vue`, `fitDiagram.ts`)
and `engines/` (`camunda.ts` — properties-panel config). The `composables/`, `internal/` and
`engines/` directories are published to npm alongside `components/`.

#### `components/DmnDrd.vue`
1. **Fetches DMN XML**: Loads `.dmn` files from the `public/` folder via fetch
2. **Renders using dmn-js**: Creates an off-screen DOM container (1920x1080) to render the DRD
3. **Exports to SVG**: Extracts the rendered SVG from dmn-js viewer
4. **Injects into template**: Inserts the SVG with responsive sizing into the component's DOM

#### `components/DmnTable.vue`
1. **Fetches DMN XML**: Loads `.dmn` files from the `public/` folder via fetch
2. **Renders using dmn-js**: Attaches the viewer directly to a container in the DOM
3. **Opens decision table view**: Navigates to the specified decision table (or first found)
4. **Dual lifecycle**: Uses both `onMounted` and `onSlideEnter` for PDF export and live preview compatibility

#### `components/DmnModeler.vue`
1. **Thumbnail viewer**: Renders a read-only DRD preview in the slide (`dmn-js/lib/Viewer`), fit via `fitDiagram`
2. **Fullscreen editor**: An "Edit" button opens an interactive `dmn-js/lib/Modeler` in a `<Teleport>` overlay; edit the DRD and double-click a decision to edit its table
3. **Save-on-close**: On close, `saveXML()` is compared to the loaded XML; if changed, the slide thumbnail re-renders
4. **Optional Camunda panel**: With `engine="camunda"`, mounts `dmn-js-properties-panel` (config nested under the modeler's `drd:` key) with a hide/show toggle
5. **Blank canvas**: With no `dmnFilePath`, imports a minimal blank DMN template so the modeler opens ready to edit

### Key Implementation Details

- DmnDrd uses an **off-screen rendering approach** because dmn-js requires a DOM element to render DRD diagrams as SVG
- DmnTable renders **directly in the DOM** because decision tables are HTML-based, not SVG
- The off-screen container has a **fixed 1920x1080 size** for DRD rendering
- SVG sizing is controlled via `maxWidth` and `height` style properties with `preserveAspectRatio="xMidYMid meet"` for responsive scaling
- DMN file paths are resolved relative to `window.location.origin + import.meta.env.BASE_URL`
- DmnModeler nests `additionalModules`/`propertiesPanel` under a **`drd:` key** (dmn-js modelers are composed of per-view editors), with `moddleExtensions` at the top level

### Vite Configuration

The `vite.config.ts` file is **critical** for this addon to work. It includes dmn-js and its dependencies in Vite's dependency optimization to prevent runtime module resolution issues in Slidev projects.

## Package Distribution

The npm package includes only:
- `components/` directory (DmnDrd.vue, DmnTable.vue, DmnModeler.vue)
- `composables/`, `internal/`, `engines/` directories (shared helpers used by the components)
- `vite.config.ts` (required Vite configuration)

Everything else (`example.md`, `public/`, `docs/`) is excluded via the `files` field in package.json.

## Testing

Use `example.md` as the test file - it demonstrates the component usage with a sample DMN diagram (`public/example.dmn`).

## Development Process
- When working with this repository, always use semantic commit-messages (e.g. feat: add dmn component)

## Release & Publishing

Releases are automated via [release-please](https://github.com/googleapis/release-please). Pushing conventional commits (`feat:`, `fix:`, `deps:`) to `main` opens a release PR; merging it creates the tag + GitHub Release and triggers `npm publish --provenance` via OIDC. Config: `release-please-config.json`, `.release-please-manifest.json`, workflow: `.github/workflows/release-please.yml`.

## Skills

This repo ships with custom Claude Code skills in `.claude/skills/`. When a task matches an available skill, then use this skill instead of implementing it manually.

| Skill | Command | When to use |
|-------|---------|-------------|
| create-ticket | `/create-ticket` | Create a GitHub issue (feature, bug, or refactor) |
