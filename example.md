---
theme: '@miragon/slidev-toolkit'
colorSchema: light
highlighter: shiki
transition: slide-up
layout: cover
eyebrow: Slidev Addon
---

# DMN in **Slidev**

Drop your `.dmn` files straight into the deck. No screenshots, no manual exports.

---
layout: hero
eyebrow: Why this addon
accent: blue
---

# Model the decision, embed the **real** table.

Static diagram, live decision simulation, or an editable modeler; all from the same `.dmn` file.

---
layout: dmn
title: Static requirement diagrams
eyebrow: DmnDrd
accent: blue
diagram: /example.dmn
mode: drd
height: 300px
fontSize: 11px
---

The graphical Decision Requirements Diagram, rendered as a clean static SVG. Best for print and PDF export.

---
layout: content
title: The DmnDrd component
eyebrow: DmnDrd
accent: blue
---

Renders the DRD of a `.dmn` file as a static, inline SVG. Ideal for print and PDF export.

| Prop | Type | Description |
|---|---|---|
| `dmnFilePath` | string | Path to the file (required) |
| `width` | string | Canvas width (default 100%) |
| `height` | string | Canvas height (default auto) |
| `fontSize` | string | Diagram font size (default 12px) |

`<DmnDrd dmnFilePath="/example.dmn" height="300px" />`

---
layout: dmn
title: Static decision tables
eyebrow: DmnTable
accent: blue
diagram: /example.dmn
mode: table
height: 340px
fontSize: 11px
---

The decision table itself, rules laid out row by row so the audience sees exactly how each decision is made.

---
layout: content
title: The DmnTable component
eyebrow: DmnTable
accent: blue
---

Renders a decision table directly as HTML, so the rules stay crisp and readable.

| Prop | Type | Description |
|---|---|---|
| `dmnFilePath` | string | Path to the file (required) |
| `decisionId` | string | Which decision to show (default first found) |
| `showAnnotations` | boolean | Show the annotations column (default false) |
| `showDrdButton` | boolean | Add a View DRD button (default false) |
| `fontSize` | string | Table font size (default 12px) |
| `height` | string | Canvas height (default auto) |

`<DmnTable dmnFilePath="/example.dmn" height="340px" />`

---
layout: dmn
title: Live decision simulation
eyebrow: DmnSimulate
accent: green
diagram: /example.dmn
mode: simulate
height: 300px
fontSize: 10px
---

Pick the inputs, run the decision, and watch the matching rule light up. DMN's answer to BPMN token simulation.

---
layout: content
title: The DmnSimulate component
eyebrow: DmnSimulate
accent: green
---

Turns a table into a live decision. Feed inputs in, evaluate them with FEEL, and highlight the firing rule.

| Prop | Type | Description |
|---|---|---|
| `dmnFilePath` | string | Path to the file (required) |
| `decisionId` | string | Which decision to evaluate (default first found) |
| `showDrdButton` | boolean | Add a View DRD button (default false) |
| `showAnnotations` | boolean | Show the annotations column (default false) |
| `fullscreenFontSize` | string | Table font size in fullscreen (default 12px) |
| `fontSize` | string | Table font size (default 12px) |

`<DmnSimulate dmnFilePath="/example.dmn" height="300px" />`

---
layout: dmn
title: Live DMN modeler
eyebrow: DmnModeler
accent: blue
diagram: /example.dmn
mode: modeler
engine: camunda
height: 320px
---

Edit the decision live in a workshop. Double-click a decision to open its table, with an optional Camunda properties panel.

---
layout: content
title: The DmnModeler component
eyebrow: DmnModeler
accent: blue
---

A full modeler canvas for workshops. Omit the file for a blank canvas, or set an `engine` for its properties panel.

| Prop | Type | Description |
|---|---|---|
| `dmnFilePath` | string | Path to the file (omit for a blank canvas) |
| `engine` | camunda | Adds the Camunda properties panel |
| `width` | string | Canvas width (default 100%) |
| `height` | string | Canvas height (default 500px) |

`<DmnModeler dmnFilePath="/example.dmn" engine="camunda" height="320px" />`

---
layout: section
eyebrow: DmnSimulate
accent: green
---

# Hit policies

How does a table decide which rule wins when several match? DmnSimulate implements the full DMN set.

---
layout: dmn
title: UNIQUE
eyebrow: Hit Policy
accent: green
diagram: /hit-policies/unique.dmn
mode: simulate
height: 250px
fontSize: 11px
---

At most one rule may match. The ranges do not overlap, so a Spend of 3000 picks exactly one tier. Two matches would raise a violation.

---
layout: dmn
title: FIRST
eyebrow: Hit Policy
accent: green
diagram: /hit-policies/first.dmn
mode: simulate
height: 250px
fontSize: 11px
---

Rules overlap and the first match wins. An OrderTotal of 600 matches all three, but only 20 percent fires; the rows below stay greyed-out candidates.

---
layout: dmn
title: PRIORITY
eyebrow: Hit Policy
accent: green
diagram: /hit-policies/priority.dmn
mode: simulate
height: 250px
fontSize: 11px
---

Overlapping rules, but the output with the highest priority wins. A Score of 550 matches all three, yet Decline wins, not the first row.

---
layout: dmn
title: ANY
eyebrow: Hit Policy
accent: green
diagram: /hit-policies/any.dmn
mode: simulate
height: 250px
fontSize: 11px
---

Several rules may match, as long as they agree. An Age of 25 matches both rules and both say Granted. Differing outputs would raise a violation.

---
layout: dmn
title: COLLECT
eyebrow: Hit Policy
accent: green
diagram: /hit-policies/collect.dmn
mode: simulate
height: 250px
fontSize: 11px
---

Gather all matching outputs as a list. A Cart of 250 collects every applicable promotion.

---
layout: dmn
title: COLLECT with SUM
eyebrow: Hit Policy
accent: green
diagram: /hit-policies/collect-sum.dmn
mode: simulate
height: 250px
fontSize: 11px
---

An aggregation collapses the matches into one number. A Cart of 250 sums the loyalty points to 35. MIN, MAX and COUNT work the same way.

---
layout: dmn
title: RULE ORDER
eyebrow: Hit Policy
accent: green
diagram: /hit-policies/rule-order.dmn
mode: simulate
height: 250px
fontSize: 11px
---

Like COLLECT, but the list keeps the table order. A Temp of 40 returns Heat, then Extreme Heat.

---
layout: dmn
title: OUTPUT ORDER
eyebrow: Hit Policy
accent: green
diagram: /hit-policies/output-order.dmn
mode: simulate
height: 250px
fontSize: 11px
---

All matches, sorted by output priority. The same input as RULE ORDER, but the order flips to Extreme Heat, then Heat.

---
layout: person
name: Marco Schäck
photo: /marco.png
eyebrow: The developer behind it
accent: blue
side: left
---

Open-source engineer building solutions around BPMN, DMN and process automation in general, as **emaarco**. Find me on [<carbon-logo-linkedin/>LinkedIn](https://linkedin.com/in/schaeckm), [<carbon-logo-medium />Medium](https://medium.com/@emaarco) and [<carbon-logo-github />GitHub](https://github.com/emaarco).
