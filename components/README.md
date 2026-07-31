# `components/` — the addon's public surface

Slidev auto-registers **every component in this directory as a global** in the
consuming slide deck (via `unplugin-vue-components`; the addon root's
`components/` dir is scanned by `@slidev/cli`). So a file here becomes usable in
any `.md` slide **without an import**:

```md
<DmnDrd dmnFilePath="/example.dmn" />
<DmnTable dmnFilePath="/example.dmn" />
<DmnSimulate dmnFilePath="/example.dmn" />
<DmnModeler engine="camunda" />
```

That makes this folder the addon's **public API** — put a component here only if
end users should mount it directly.

## Consequences

- **Registered by filename, not path.** A subfolder (`components/ui/Button.vue`)
  still leaks a global `<Button>` into every deck. Don't hide internals here.
- **Internal building blocks live outside `components/`.** Shared UI atoms and
  helpers go in [`../shared/`](../shared) (`shared/ui/*`, `shared/lib/*`) and are
  imported explicitly — they never touch the consumer's global namespace.
- Data fetching / loading state sits in [`../composables/`](../composables);
  engine wiring in [`../engines/`](../engines).

## Current components

| Component | Purpose |
|---|---|
| `DmnDrd.vue` | Static SVG rendering of the DRD (off-screen render, best for PDF export) |
| `DmnTable.vue` | Renders a DMN decision table directly in the DOM |
| `DmnSimulate.vue` | Renders a decision table with an input form; evaluates it with FEEL and highlights the matched rule (DMN's answer to BPMN token simulation) |
| `DmnModeler.vue` | Live DMN modeler; optional `engine` prop mounts a properties panel |
