<template>
  <div class="dmn-simulate" :style="{ width: props.width }">
    <p v-if="loading">Loading DMN decision table...</p>
    <p v-else-if="error" class="text-red-500">{{ error }}</p>

    <!-- Input form: one control per decision-table input -->
    <form v-if="model" class="sim-inputs" @submit.prevent="runSimulation">
      <div v-for="(input, i) in model.inputs" :key="input.id" class="sim-field">
        <label>{{ input.label }}</label>
        <select v-if="input.options.length" v-model="values[i]">
          <option value="">–</option>
          <option v-for="option in input.options" :key="option" :value="option">{{ option }}</option>
        </select>
        <input
          v-else
          v-model="values[i]"
          :type="isNumericType(input.typeRef) ? 'number' : 'text'"
          :placeholder="input.typeRef"
        />
      </div>
      <button
        type="submit"
        class="sim-run"
        :disabled="!isComplete"
        :title="isComplete ? 'Run the simulation' : 'Fill in every input first'"
      >Simulate</button>
      <button type="button" class="sim-reset" @click="reset">Reset</button>
    </form>

    <!-- The decision table, rendered by dmn-js -->
    <div
      ref="containerRef"
      class="dmn-table-wrapper"
      :class="{ 'hide-annotations': !props.showAnnotations, 'hide-drd-button': !props.showDrdButton }"
      :style="{
        width: `calc(${props.width} - ${5 * 2}px)`,
        height: props.height,
        margin: `5px`,
        '--dmn-table-font-size': props.fontSize,
      }"
    ></div>

    <!-- Result of the last simulation -->
    <div
      v-if="result"
      class="sim-result"
      :class="{ 'sim-result--miss': !result.matchedRuleIndices.length, 'sim-result--warn': !!result.violation }"
    >
      <span class="sim-arrow">→</span>

      <!-- COLLECT with an aggregation collapses to a single scalar -->
      <span v-if="result.aggregation" class="sim-output">
        {{ result.aggregation.fn }}({{ result.aggregation.output }}) =
        <strong>{{ result.aggregation.value }}</strong>
      </span>

      <!-- One pill per reported output row (list policies show several) -->
      <template v-else-if="result.outputs.length">
        <span v-for="(output, oi) in result.outputs" :key="oi" class="sim-output">
          <template v-for="(value, key) in output" :key="key">
            {{ key }} = <strong>{{ formatValue(value) }}</strong>
          </template>
        </span>
      </template>

      <span v-else class="sim-none">no matching rule</span>

      <span v-if="result.violation" class="sim-violation">⚠ {{ result.violation }}</span>

      <span v-if="result.reportedRuleIndices.length" class="sim-rule">
        {{ result.reportedRuleIndices.length > 1 ? 'Rules' : 'Rule' }}
        {{ result.reportedRuleIndices.map(i => i + 1).join(', ') }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import DmnViewer from 'dmn-js/lib/Viewer'
import 'dmn-js/dist/assets/diagram-js.css'
import 'dmn-js/dist/assets/dmn-js-shared.css'
import 'dmn-js/dist/assets/dmn-js-decision-table.css'
import 'dmn-js/dist/assets/dmn-js-decision-table-controls.css'
import 'dmn-js/dist/assets/dmn-font/css/dmn-embedded.css'
import { onSlideEnter } from '@slidev/client'
import { useDmn } from '../composables/useDmn'
import { isNumericType, parseDecisionModel, type DecisionModel } from '../shared/lib/dmnModel'
import { evaluateDecision, type EvaluationResult, type RawValue } from '../shared/lib/evaluateDecision'

const props = withDefaults(defineProps<{
  dmnFilePath: string
  width?: string
  height?: string
  decisionId?: string
  fontSize?: string
  showAnnotations?: boolean
  showDrdButton?: boolean
}>(), {
  width: '100%',
  height: '340px',
  fontSize: '12px',
  showAnnotations: false,
  showDrdButton: false,
})

const { loading, error, fetchDmnXml } = useDmn()
const containerRef = ref<HTMLDivElement | null>(null)
const model = ref<DecisionModel | null>(null)
const values = ref<RawValue[]>([])
const result = ref<EvaluationResult | null>(null)
const isRendered = ref(false)
const isUnmounted = ref(false)

// Only allow simulating once every input has a value — an incomplete input set
// can never match a concrete rule, so the button stays disabled until then.
const isComplete = computed(() =>
  !!model.value
  && model.value.inputs.length > 0
  && values.value.length === model.value.inputs.length
  && values.value.every(v => v !== '' && v !== null && v !== undefined),
)

onBeforeUnmount(() => {
  isUnmounted.value = true
})

// Any input change invalidates the previous run — clear the result + highlight
// so the table never shows a stale match next to fresh inputs.
watch(values, () => {
  if (result.value) {
    result.value = null
    applyHighlight([], [])
  }
}, { deep: true })

async function waitForContainer(): Promise<void> {
  return new Promise((resolve) => {
    const checkDimensions = () => {
      if (isUnmounted.value) {
        resolve()
      } else if (containerRef.value && containerRef.value.clientWidth > 0 && containerRef.value.clientHeight > 0) {
        resolve()
      } else {
        requestAnimationFrame(checkDimensions)
      }
    }
    checkDimensions()
  })
}

/**
 * Fetch the DMN once, parse it into a simulation model, then render the table
 * via dmn-js. Guarded against the duplicate onMounted/onSlideEnter calls Slidev
 * makes (mirrors DmnTable).
 */
async function setup() {
  if (isRendered.value) return
  isRendered.value = true
  loading.value = true
  error.value = null

  try {
    await waitForContainer()
    if (isUnmounted.value) return

    const dmnXml = await fetchDmnXml(props.dmnFilePath)
    model.value = parseDecisionModel(dmnXml, props.decisionId)
    values.value = model.value.inputs.map(() => '')

    // Let the container mount before dmn-js measures it.
    await nextTick()

    const viewer = new DmnViewer({ container: containerRef.value! })
    await viewer.importXML(dmnXml)

    const views = viewer.getViews()
    const tableView = props.decisionId
      ? views.find((v: any) => v.type === 'decisionTable' && v.element?.id === props.decisionId)
      : views.find((v: any) => v.type === 'decisionTable')
    if (!tableView) {
      throw new Error('No decision table view found in DMN file')
    }
    await viewer.open(tableView)
  } catch (err) {
    isRendered.value = false
    model.value = null
    error.value = `Failed to load DMN: ${err instanceof Error ? err.message : String(err)}`
    console.error('DMN loading error:', err)
  } finally {
    loading.value = false
  }
}

function runSimulation() {
  if (!model.value || !isComplete.value) return
  const evaluation = evaluateDecision(model.value, values.value)
  result.value = evaluation
  applyHighlight(evaluation.reportedRuleIndices, evaluation.matchedRuleIndices)
}

function reset() {
  if (model.value) values.value = model.value.inputs.map(() => '')
  result.value = null
  applyHighlight([], [])
}

/**
 * Highlight rules directly in the dmn-js DOM. Rows render in document order, so
 * rule index N maps to the Nth `<tbody>` row. Rules the hit policy actually
 * reports get the strong `sim-match` style; rules that merely matched but were
 * dropped by the policy (e.g. under FIRST/PRIORITY) get the subtle
 * `sim-candidate` style, making the policy's effect visible.
 */
function applyHighlight(reported: number[], matched: number[]) {
  const rows = containerRef.value?.querySelectorAll('.dmn-decision-table-container tbody tr') ?? []
  rows.forEach((row, i) => {
    row.classList.toggle('sim-match', reported.includes(i))
    row.classList.toggle('sim-candidate', matched.includes(i) && !reported.includes(i))
  })

  // The table scrolls internally when it is taller than the slide allows, so a
  // matched rule below the fold would stay hidden — scroll the first relevant
  // row into the visible band of the table's own scroll container (never the page).
  const focusIndex = reported[0] ?? matched[0]
  if (focusIndex === undefined) return
  const firstRow = rows[focusIndex] as HTMLElement | undefined
  const scroller = containerRef.value?.querySelector('.tjs-table-container') as HTMLElement | null
  if (!firstRow || !scroller) return
  const rowRect = firstRow.getBoundingClientRect()
  const scrollRect = scroller.getBoundingClientRect()
  if (rowRect.top < scrollRect.top || rowRect.bottom > scrollRect.bottom) {
    scroller.scrollTop += (rowRect.top - scrollRect.top) - (scrollRect.height - rowRect.height) / 2
  }
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '–'
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}

onMounted(async () => {
  await nextTick()
  await setup()
})

onSlideEnter(async () => {
  await setup()
})
</script>

<style>
.dmn-simulate {
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* --- Simulation input form --- */
.dmn-simulate .sim-inputs {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px;
  padding: 8px 5px;
}

.dmn-simulate .sim-field {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.dmn-simulate .sim-field label {
  font-size: 11px;
  font-weight: 600;
  color: #555;
}

.dmn-simulate .sim-field input,
.dmn-simulate .sim-field select {
  font-size: 13px;
  padding: 4px 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  min-width: 120px;
}

.dmn-simulate .sim-run,
.dmn-simulate .sim-reset {
  font-size: 13px;
  padding: 5px 12px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #ccc;
}

.dmn-simulate .sim-run {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
  font-weight: 600;
}

.dmn-simulate .sim-run:disabled {
  background: #cbd5e1;
  border-color: #cbd5e1;
  color: #eef2f7;
  cursor: not-allowed;
}

.dmn-simulate .sim-reset {
  background: white;
  color: #555;
}

/* --- Simulation result line --- */
.dmn-simulate .sim-result {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px;
  padding: 8px 10px;
  margin: 5px;
  font-size: 14px;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  border-radius: 6px;
  color: #065f46;
}

.dmn-simulate .sim-result--miss {
  background: #fef2f2;
  border-color: #fecaca;
  color: #991b1b;
}

.dmn-simulate .sim-result--warn {
  background: #fffbeb;
  border-color: #fde68a;
  color: #92400e;
}

.dmn-simulate .sim-arrow {
  font-weight: 700;
}

/* Each reported output row as a pill — several appear for list policies. */
.dmn-simulate .sim-output {
  padding: 1px 6px;
  background: rgba(6, 95, 70, 0.08);
  border-radius: 4px;
}

.dmn-simulate .sim-violation {
  flex-basis: 100%;
  font-size: 12px;
  font-weight: 600;
}

.dmn-simulate .sim-rule {
  margin-left: auto;
  font-size: 12px;
  opacity: 0.75;
}

/* --- Highlight rows in the dmn-js table --- */
/* Reported rule(s): the actual result of the hit policy. */
.dmn-simulate .dmn-decision-table-container tbody tr.sim-match td {
  background: #fef9c3 !important;
  box-shadow: inset 0 0 0 9999px rgba(250, 204, 21, 0.18);
}

/* Candidate rule(s): matched, but dropped by the policy (e.g. FIRST/PRIORITY). */
.dmn-simulate .dmn-decision-table-container tbody tr.sim-candidate td {
  background: #f1f5f9 !important;
  box-shadow: inset 0 0 0 9999px rgba(148, 163, 184, 0.14);
}

/* --- Table styling (mirrors DmnTable so DmnSimulate stands alone) --- */
.dmn-simulate .dmn-table-wrapper .dmn-decision-table-container {
  font-size: var(--dmn-table-font-size, 12px) !important;
}

.dmn-simulate .dmn-table-wrapper .dmn-decision-table-container .decision-table-name {
  font-size: calc(var(--dmn-table-font-size, 12px) * 1.5) !important;
}

.dmn-simulate .dmn-table-wrapper .tjs-container {
  width: 100% !important;
}

.dmn-simulate .dmn-table-wrapper .tjs-table-container {
  overflow-x: hidden !important;
  overflow-y: auto !important;
}

.dmn-simulate .dmn-table-wrapper .tjs-table {
  width: 100% !important;
  table-layout: fixed !important;
}

.dmn-simulate .dmn-table-wrapper th:not(:first-child),
.dmn-simulate .dmn-table-wrapper td:not(:first-child) {
  padding: 2px !important;
}

.dmn-simulate .dmn-table-wrapper th.index-column {
  width: 36px !important;
}

.dmn-simulate .dmn-table-wrapper.hide-annotations th.annotation,
.dmn-simulate .dmn-table-wrapper.hide-annotations td.annotation {
  display: none !important;
}

.dmn-simulate .dmn-table-wrapper.hide-drd-button .view-drd {
  display: none !important;
}

/* --- Pin the bpmn.io watermark to a consistent spot ---
   dmn-js anchors its (license-required) logo to the decision-table container,
   whose height tracks the row count — so the logo floats below short tables but
   overlaps the last row of tall ones. Re-anchor it to the fixed-height wrapper
   so it always sits in the same bottom-right corner. The logo stays fully
   visible and clickable, as the bpmn.io license requires. */
.dmn-simulate .dmn-table-wrapper {
  position: relative;
}

.dmn-simulate .dmn-table-wrapper .dmn-js-parent,
.dmn-simulate .dmn-table-wrapper .dmn-decision-table-container,
.dmn-simulate .dmn-table-wrapper .tjs-container {
  position: static !important;
}

.dmn-simulate .dmn-table-wrapper .bjs-powered-by {
  bottom: 6px !important;
  right: 8px !important;
}
</style>
