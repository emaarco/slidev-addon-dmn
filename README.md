# 📊 slidev-addon-dmn

> [!IMPORTANT]
> **This addon has moved.** DMN support now lives in
> [**slidev-addon-diagram-js**](https://github.com/emaarco/slidev-addon-diagram-js) — development continues there.
> `slidev-addon-dmn` stays on npm at `1.7.0`, but receives no further updates.

[![new home](https://img.shields.io/badge/new%20home-slidev--addon--diagram--js-blue)](https://github.com/emaarco/slidev-addon-diagram-js)
[![npm version](https://img.shields.io/npm/v/slidev-addon-diagram-js)](https://www.npmjs.com/package/slidev-addon-diagram-js)
[![demo](https://img.shields.io/badge/demo-live-blue)](https://emaarco.github.io/slidev-addon-diagram-js/)

![DMN decision table rendered in Slidev](https://raw.githubusercontent.com/emaarco/slidev-addon-diagram-js/main/docs/dmn-example.png)

## 📖 The story

This addon started as the little sibling of `slidev-addon-bpmn`. The idea was the same: stop pasting blurry screenshots into slides and render the real model instead — just for DMN decisions rather than BPMN processes.

Over time the two addons grew into twins. Both are built on the [bpmn.io](https://bpmn.io/) toolkits, and both needed the same plumbing around them: rendering a diagram off-screen so it survives PDF export, fitting it into a slide, opening a modeler fullscreen for live editing. That code lived in two repositories, so every improvement had to be made twice.

Decisions and processes also rarely show up alone. A deck that explains a process usually explains the rules behind it too — which meant two addons to install, register and keep up to date.

So the two became one. [**slidev-addon-diagram-js**](https://github.com/emaarco/slidev-addon-diagram-js) carries BPMN and DMN on one shared foundation, and that foundation made room for more: Team Topologies, Wardley Maps and Event Storming boards now sit right next to them.

## 🚚 Moving over

Swap the dependency:

```bash
npm uninstall slidev-addon-dmn
npm install slidev-addon-diagram-js
```

And point your deck at the new addon:

```yaml
---
addons:
  - slidev-addon-diagram-js
---
```

That's it. `<DmnDrd>`, `<DmnTable>`, `<DmnSimulate>` and `<DmnModeler>` keep their names, props and defaults, so your slides need no edits. The full [migration guide](https://github.com/emaarco/slidev-addon-diagram-js/blob/main/docs/migrating.md) has the details.

## 🔗 Where to find things now

| Looking for… | Go to |
|--------------|-------|
| DMN component reference | [docs/dmn.md](https://github.com/emaarco/slidev-addon-diagram-js/blob/main/docs/dmn.md) |
| Live demo | [emaarco.github.io/slidev-addon-diagram-js](https://emaarco.github.io/slidev-addon-diagram-js/) |
| Bug reports and feature requests | [Issues](https://github.com/emaarco/slidev-addon-diagram-js/issues) |
| The old source code | [`v1.7.0`](https://github.com/emaarco/slidev-addon-dmn/tree/v1.7.0) — the last release of this repository |

## 🙏 Credits

- [dmn-js](https://github.com/bpmn-io/dmn-js) by [bpmn.io](https://bpmn.io/)
- Everyone who used, tested and contributed to `slidev-addon-dmn` — thank you, and see you over at [slidev-addon-diagram-js](https://github.com/emaarco/slidev-addon-diagram-js) 👋
