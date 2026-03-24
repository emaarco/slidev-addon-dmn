<template>
  <div>
    <p v-if="loading">Loading DMN diagram...</p>
    <p v-if="error" class="text-red-500">{{ error }}</p>
    <div v-if="svg" v-html="svg"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import DmnViewer from 'dmn-js/lib/Viewer'
import 'dmn-js/dist/assets/diagram-js.css'
import 'dmn-js/dist/assets/dmn-js-shared.css'
import 'dmn-js/dist/assets/dmn-js-drd.css'
import 'dmn-js/dist/assets/dmn-font/css/dmn-embedded.css'

const loading = ref(false)
const error = ref<string | null>(null)
const svg = ref<string | null>(null)

const props = withDefaults(defineProps<{
  dmnFilePath: string
  width?: string
  height?: string
  fontSize?: string
}>(), {
  width: '100%',
  height: 'auto',
  fontSize: '12px',
})

onMounted(async () => {
  loading.value = true
  error.value = null

  try {
    await loadAndRenderDrd(props.dmnFilePath)
  } catch (err) {
    error.value = `Failed to load DMN: ${err instanceof Error ? err.message : String(err)}`
    console.error('DMN loading error:', err)
  } finally {
    loading.value = false
  }
})

async function loadAndRenderDrd(path: string): Promise<void> {
  const url = new URL(path, window.location.origin + import.meta.env.BASE_URL).href
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch DMN file: ${response.status}`)
  }

  const dmnXml = await response.text()

  // Create off-screen container for dmn-js rendering (requires DOM element)
  const container = document.createElement('div')
  container.style.width = '1920px'
  container.style.height = '1080px'
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  document.body.appendChild(container)

  const viewer = new DmnViewer({
    container,
    drd: {
      textRenderer: {
        defaultStyle: { fontSize: parseInt(props.fontSize, 10) || 12 }
      }
    }
  })

  try {
    await viewer.importXML(dmnXml)

    // Navigate to the DRD view
    const views = viewer.getViews()
    const drdView = views.find((v: any) => v.type === 'drd')
    if (!drdView) {
      throw new Error('No DRD view found in DMN file')
    }
    await viewer.open(drdView)

    const activeViewer = viewer.getActiveViewer()
    const { svg: svgContent } = await activeViewer.saveSVG()

    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml')
    const svgElement = svgDoc.documentElement

    svgElement.style.maxWidth = props.width
    svgElement.style.height = props.height
    svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet')

    svg.value = svgElement.outerHTML
  } finally {
    viewer.destroy()
    document.body.removeChild(container)
  }
}
</script>
