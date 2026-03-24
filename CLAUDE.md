# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Slidev addon that enables displaying DMN (Decision Model and Notation) diagrams in presentations. It uses dmn-js to render DMN XML files as SVG elements and HTML tables within Vue components.

## Development Commands

```bash
# Run the example presentation in dev mode
npm run dev

# Build the example presentation
npm run build

# Export presentation to PDF
npm run export

# Export presentation to PNG screenshots
npm run screenshot
```

## Architecture

### Core Components

The addon consists of two Vue components:

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

### Key Implementation Details

- DmnDrd uses an **off-screen rendering approach** because dmn-js requires a DOM element to render DRD diagrams as SVG
- DmnTable renders **directly in the DOM** because decision tables are HTML-based, not SVG
- The off-screen container has a **fixed 1920x1080 size** for DRD rendering
- SVG sizing is controlled via `maxWidth` and `height` style properties with `preserveAspectRatio="xMidYMid meet"` for responsive scaling
- DMN file paths are resolved relative to `window.location.origin + import.meta.env.BASE_URL`

### Vite Configuration

The `vite.config.ts` file is **critical** for this addon to work. It includes dmn-js and its dependencies in Vite's dependency optimization to prevent runtime module resolution issues in Slidev projects.

## Package Distribution

The npm package includes only:
- `components/` directory (DmnDrd.vue and DmnTable.vue)
- `vite.config.ts` (required Vite configuration)

Everything else (`example.md`, `public/`, `docs/`) is excluded via the `files` field in package.json.

## Testing

Use `example.md` as the test file - it demonstrates the component usage with a sample DMN diagram (`public/example.dmn`).

## Development Process
- When working with this repository, always use semantic commit-messages (e.g. feat: add dmn component)

## Release & Publishing

Use the `/publish-release` skill to create and publish new releases.

## Skills

This repo ships with custom Claude Code skills in `.claude/skills/`. When a task matches an available skill, then use this skill instead of implementing it manually.

| Skill | Command | When to use |
|-------|---------|-------------|
| publish-release | `/publish-release` | Create and publish a new npm release |
| create-ticket | `/create-ticket` | Create a GitHub issue (feature, bug, or refactor) |
