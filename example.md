<style>
h1 {
  color: #335DE4;
  font-weight: bold;
  margin-bottom: 0;
}

h2 {
  color: #1E3A8A;
  font-weight: bold;
  margin-bottom: 1rem;
}

p {
  color: #6b7280;
  margin-bottom: 1rem;
}

code {
  color: #9333ea;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
}
</style>

# slidev-addon-dmn

Embed your DMN models direkt and gscheid – because screenshot Gefrickel is just zwider.
Drop your `.dmn` files directly into your Slidev.
No manual export chaos, just saubere decision diagrams!

**Features:**
- Static DRD rendering for PDFs and presentations
- Decision Table rendering for rule visualization

---

## DRD Diagrams

The `DmnDrd` component renders Decision Requirements Diagrams as static SVG images – koa screenshot Schmarrn, koa manual export Humbug, just clean SVG rendering that schaug richtig fesch aus!

<DmnDrd dmnFilePath="./example.dmn" height="300px" fontSize="11px"></DmnDrd>

---

## Decision Tables

The `DmnTable` component renders Decision Tables directly – the rules laid out sauber and klar! Your audience kapiert sofort how the decisions are made, koa langweiliges Gschwafel needed!

<DmnTable dmnFilePath="./example.dmn" height="350px" fontSize="11px"></DmnTable>
