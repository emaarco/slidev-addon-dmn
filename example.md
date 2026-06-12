---
colorSchema: light
---

# slidev-addon-dmn

Embed your DMN models direkt and gscheid – because screenshot Gefrickel is just zwider.
Drop your `.dmn` files directly into your Slidev.
No manual export chaos, just saubere decision diagrams!

**Features:**
- Static DRD rendering for PDFs and presentations
- Decision Table rendering for rule visualization
- Live DMN modeling for workshops and trainings

---

## DRD Diagrams

The `DmnDrd` component renders Decision Requirements Diagrams as static SVG images – koa screenshot Schmarrn, koa manual export Humbug, just clean SVG rendering that schaug richtig fesch aus!

<DmnDrd dmnFilePath="./example.dmn" height="300px" fontSize="11px"></DmnDrd>

---

## Decision Tables

The `DmnTable` component renders Decision Tables directly – the rules laid out sauber and klar! Your audience kapiert sofort how the decisions are made, koa langweiliges Gschwafel needed!

<DmnTable dmnFilePath="./example.dmn" height="350px" fontSize="11px"></DmnTable>

---

## Live DMN Modeler

The `DmnModeler` component embeds an editable diagram – hit **Edit** and the DMN opens fullscreen. Tweak the DRD, double-click the **Dish** decision to edit its table live, then **Close** and the slide reflects your changes. Ideal for workshops where you build decisions together with your audience!

<DmnModeler dmnFilePath="./example.dmn" height="350px"></DmnModeler>

---

## Modeler with Camunda Panel

Pass `engine="camunda"` and you get the Camunda properties panel side-by-side – edit ids, names and execution-related Camunda properties without Tool-Hopserei. The panel can be hidden via the toolbar when you need the full canvas.

<DmnModeler dmnFilePath="./example.dmn" engine="camunda" height="350px"></DmnModeler>

---

## Blank Canvas Modeler

No `dmnFilePath`? Dann gibt's nur die Zeichenfläche – a bare modeler for building a decision model from scratch in a live session.

<DmnModeler height="350px"></DmnModeler>
