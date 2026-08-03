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
eyebrow: Dmn-Drd
accent: blue
diagram: /example.dmn
mode: drd
height: 300px
fontSize: 11px
---

The Decision Requirements Diagram as a clean static SVG. Ideal for print and PDF.

---
layout: content
title: The DmnDrd component
eyebrow: Dmn-Drd
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
eyebrow: Dmn-Table
accent: blue
diagram: /example.dmn
mode: table
height: 275px
fontSize: 10px
---

The decision table itself, every rule laid out row by row.

---
layout: content
title: The DmnTable component
eyebrow: Dmn-Table
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
eyebrow: Dmn-Simulate
accent: green
diagram: /example.dmn
mode: simulate
height: 225px
fontSize: 9px
---

Pick the inputs, run the decision, watch the matching rule light up.

---
layout: content
title: The DmnSimulate component
eyebrow: Dmn-Simulate
accent: green
---

Simulate a decision. Feed inputs in, evaluate them with FEEL, and highlight the firing rule.

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
eyebrow: Dmn-Modeler
accent: blue
diagram: /example.dmn
mode: modeler
engine: camunda
height: 320px
---

Edit the decision live in a workshop, with an optional Camunda properties panel.

---
layout: content
title: The DmnModeler component
eyebrow: Dmn-Modeler
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
eyebrow: Dmn-Simulate
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
height: 225px
fontSize: 10px
---

At most one rule may match. The ranges never overlap, so a Spend of 3000 picks exactly one tier.

---
layout: dmn
title: FIRST
eyebrow: Hit Policy
accent: green
diagram: /hit-policies/first.dmn
mode: simulate
height: 225px
fontSize: 10px
---

Rules overlap and the first match wins. An OrderTotal of 600 matches all three, but only 20 percent fires.

---
layout: dmn
title: PRIORITY
eyebrow: Hit Policy
accent: green
diagram: /hit-policies/priority.dmn
mode: simulate
height: 225px
fontSize: 10px
---

The highest-priority output wins. A Score of 550 matches all three, yet Decline wins, not the first row.

---
layout: dmn
title: ANY
eyebrow: Hit Policy
accent: green
diagram: /hit-policies/any.dmn
mode: simulate
height: 225px
fontSize: 10px
---

Several rules may match, as long as they agree. An Age of 25 matches both, and both say Granted.

---
layout: dmn
title: COLLECT
eyebrow: Hit Policy
accent: green
diagram: /hit-policies/collect.dmn
mode: simulate
height: 225px
fontSize: 10px
---

Gather all matching outputs as a list. A Cart of 250 collects every applicable promotion.

---
layout: dmn
title: COLLECT with SUM
eyebrow: Hit Policy
accent: green
diagram: /hit-policies/collect-sum.dmn
mode: simulate
height: 225px
fontSize: 10px
---

An aggregation collapses the matches into one number. A Cart of 250 sums the loyalty points to 35.

---
layout: dmn
title: RULE ORDER
eyebrow: Hit Policy
accent: green
diagram: /hit-policies/rule-order.dmn
mode: simulate
height: 225px
fontSize: 10px
---

Like COLLECT, but the list keeps the table order. A Temp of 40 returns Heat, then Extreme Heat.

---
layout: dmn
title: OUTPUT ORDER
eyebrow: Hit Policy
accent: green
diagram: /hit-policies/output-order.dmn
mode: simulate
height: 225px
fontSize: 10px
---

All matches, sorted by output priority. A Temp of 40 flips to Extreme Heat, then Heat.

---
layout: person
name: Marco Schäck
photo: /marco.png
eyebrow: The developer behind it
accent: blue
side: left
---

Open-source engineer building solutions around BPMN, DMN and process automation in general, as **emaarco**. Find me on [<carbon-logo-linkedin/>LinkedIn](https://linkedin.com/in/schaeckm), [<carbon-logo-medium />Medium](https://medium.com/@emaarco) and [<carbon-logo-github />GitHub](https://github.com/emaarco).
