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
- Live decision simulation – evaluate inputs and watch the matching rule fire
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

## Decision Simulation

The `DmnSimulate` component makes a table a **live decision** – pick the inputs, hit **Simulate**, the matching rule lights up. DMN's answer to BPMN token simulation: feed inputs in, watch the rule fire.

<DmnSimulate dmnFilePath="./example.dmn" height="305px" fontSize="9px"></DmnSimulate>

---

## Hit Policy: UNIQUE

**UNIQUE** – at most one rule may match. The ranges don't overlap, so a `Spend` picks exactly one tier (try `3000` → Silver). If two rules ever matched, you'd get a violation warning.

<DmnSimulate dmnFilePath="./hit-policies/unique.dmn" height="240px" fontSize="11px"></DmnSimulate>

---

## Hit Policy: FIRST

**FIRST** – rules overlap, the first match wins. Try `OrderTotal = 600`: all three rules match, but only **20 %** fires – the rows below stay greyed-out candidates.

<DmnSimulate dmnFilePath="./hit-policies/first.dmn" height="240px" fontSize="11px"></DmnSimulate>

---

## Hit Policy: PRIORITY

**PRIORITY** – overlapping rules, but the output with the highest priority wins (order: Decline ▸ Review ▸ Approve). `Score = 550` matches all three, yet **Decline** wins – not the first row.

<DmnSimulate dmnFilePath="./hit-policies/priority.dmn" height="240px" fontSize="11px"></DmnSimulate>

---

## Hit Policy: ANY

**ANY** – several rules may match, as long as they agree. `Age = 25` matches both rules and both say **Granted**, so you get one clean result. Differing outputs would raise a violation.

<DmnSimulate dmnFilePath="./hit-policies/any.dmn" height="230px" fontSize="11px"></DmnSimulate>

---

## Hit Policy: COLLECT

**COLLECT** – gather *all* matching outputs as a list. `Cart = 250` collects every applicable promotion.

<DmnSimulate dmnFilePath="./hit-policies/collect.dmn" height="240px" fontSize="11px"></DmnSimulate>

---

## Hit Policy: COLLECT + SUM

**COLLECT** with an aggregation collapses the matches into one number. `Cart = 250` sums the loyalty points (5 + 10 + 20 = **35**). `MIN`, `MAX` and `COUNT` work the same way.

<DmnSimulate dmnFilePath="./hit-policies/collect-sum.dmn" height="240px" fontSize="11px"></DmnSimulate>

---

## Hit Policy: RULE ORDER

**RULE ORDER** – like COLLECT, but the list keeps the table's rule order. `Temp = 40` → [Heat, Extreme Heat].

<DmnSimulate dmnFilePath="./hit-policies/rule-order.dmn" height="230px" fontSize="11px"></DmnSimulate>

---

## Hit Policy: OUTPUT ORDER

**OUTPUT ORDER** – all matches, sorted by output priority (Extreme Heat ▸ Heat). Same input as RULE ORDER, but the order flips: `Temp = 40` → [Extreme Heat, Heat].

<DmnSimulate dmnFilePath="./hit-policies/output-order.dmn" height="230px" fontSize="11px"></DmnSimulate>

---

## Modeler with Camunda Panel

Pass `engine="camunda"` and you get the Camunda properties panel side-by-side – edit ids, names and execution-related Camunda properties without Tool-Hopserei. The panel can be hidden via the toolbar when you need the full canvas.

<DmnModeler dmnFilePath="./example.dmn" engine="camunda" height="350px"></DmnModeler>

---

## Blank Canvas Modeler

No `dmnFilePath`? Dann gibt's nur die Zeichenfläche – a bare modeler for building a decision model from scratch in a live session.

<DmnModeler height="350px"></DmnModeler>
