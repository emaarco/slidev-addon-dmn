<template>
  <div :style="{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: props.width, height: containerHeight }">
    <p v-if="loading">Loading DMN decision table...</p>
    <p v-else-if="error" class="text-red-500">{{ error }}</p>
    <div ref="containerRef"
         class="dmn-table-wrapper"
         :class="{ 'hide-annotations': !props.showAnnotations }"
         :style="{
           width: `calc(${props.width} - ${5 * 2}px)`,
           height: `calc(${containerHeight} - ${5 * 2}px)`,
           margin: `5px`,
           '--dmn-table-font-size': props.fontSize,
         }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import DmnViewer from 'dmn-js/lib/Viewer'
import 'dmn-js/dist/assets/diagram-js.css'
import 'dmn-js/dist/assets/dmn-js-shared.css'
import 'dmn-js/dist/assets/dmn-js-decision-table.css'
import 'dmn-js/dist/assets/dmn-js-decision-table-controls.css'
import 'dmn-js/dist/assets/dmn-font/css/dmn-embedded.css'
import { onSlideEnter } from '@slidev/client'

const loading = ref(false)
const error = ref<string | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const isRendered = ref(false)

const props = withDefaults(defineProps<{
  dmnFilePath: string
  width?: string
  height?: string
  decisionId?: string
  fontSize?: string
  showAnnotations?: boolean
}>(), {
  width: '100%',
  height: 'auto',
  fontSize: '12px',
  showAnnotations: false,
})

const containerHeight = computed(() => props.height === 'auto' ? '500px' : props.height)

/**
 * Polls for container dimensions to be ready before rendering.
 * Prevents "non-finite" SVG matrix errors when canvas operations are called.
 */
async function waitForContainer(): Promise<void> {
  return new Promise((resolve) => {
    const checkDimensions = () => {
      if (containerRef.value && containerRef.value.clientWidth > 0 && containerRef.value.clientHeight > 0) {
        resolve()
      } else {
        requestAnimationFrame(checkDimensions)
      }
    }
    checkDimensions()
  })
}

/**
 * Renders the DMN decision table.
 * Includes duplicate prevention since Slidev calls both onMounted and onSlideEnter.
 */
async function renderDmnTable() {

  // Prevent duplicate rendering
  if (isRendered.value) return
  isRendered.value = true
  loading.value = true
  error.value = null

  try {
    await waitForContainer()
    const url = new URL(props.dmnFilePath, window.location.origin + import.meta.env.BASE_URL).href
    const response = await fetch(url)

    if (!response.ok) throw new Error(`Failed to fetch DMN file: ${response.status}`)

    const dmnXml = await response.text()
    const viewer = new DmnViewer({
      container: containerRef.value!,
    })

    await viewer.importXML(dmnXml)

    // Find and open the decision table view
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
    error.value = `Failed to load DMN: ${err instanceof Error ? err.message : String(err)}`
    console.error('DMN loading error:', err)
  } finally {
    loading.value = false
  }
}

/**
 * Render on the component mount for PDF export compatibility.
 * In headless export mode, onSlideEnter doesn't fire.
 */
onMounted(async () => {
  await nextTick()
  await renderDmnTable()
})

/**
 * Render when the slide becomes active in a live preview.
 * Container dimensions are only valid when the slide is visible.
 */
onSlideEnter(async () => {
  await renderDmnTable()
})
</script>

<style>
/* Apply custom font size via CSS variable to override all dmn-js internal font sizes */
.dmn-table-wrapper .dmn-decision-table-container {
  font-size: var(--dmn-table-font-size, 12px) !important;
}

.dmn-table-wrapper .dmn-decision-table-container .decision-table-name {
  font-size: calc(var(--dmn-table-font-size, 12px) * 1.5) !important;
}

.dmn-table-wrapper .dmn-decision-table-container thead .input-label,
.dmn-table-wrapper .dmn-decision-table-container thead .input-expression,
.dmn-table-wrapper .dmn-decision-table-container thead .output-label,
.dmn-table-wrapper .dmn-decision-table-container thead .output-name {
  font-size: calc(var(--dmn-table-font-size, 12px) * 1.15) !important;
}

.dmn-table-wrapper .dmn-decision-table-container thead .clause,
.dmn-table-wrapper .dmn-decision-table-container thead .input-variable,
.dmn-table-wrapper .dmn-decision-table-container thead .output-variable {
  font-size: calc(var(--dmn-table-font-size, 12px) * 0.85) !important;
}

/* Force table to fill container width, no x-scroll */
.dmn-table-wrapper .tjs-container {
  width: 100% !important;
}

.dmn-table-wrapper .tjs-table-container {
  overflow-x: hidden !important;
  overflow-y: auto !important;
}

.dmn-table-wrapper .tjs-table {
  width: 100% !important;
  table-layout: fixed !important;
}

/* Compact cell padding */
.dmn-table-wrapper th:not(:first-child),
.dmn-table-wrapper td:not(:first-child) {
  padding: 2px !important;
}

/* Compact header height */
.dmn-table-wrapper thead .input-label,
.dmn-table-wrapper thead .input-expression,
.dmn-table-wrapper thead .output-label,
.dmn-table-wrapper thead .output-name {
  margin: 4px 4px !important;
}

.dmn-table-wrapper .decision-table-header-separator {
  height: 16px !important;
}

/* Shrink index column */
.dmn-table-wrapper th.index-column {
  width: 36px !important;
}

/* Hide annotations column when toggled off */
.dmn-table-wrapper.hide-annotations th.annotation,
.dmn-table-wrapper.hide-annotations td.annotation {
  display: none !important;
}
</style>
