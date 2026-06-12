import { ref } from 'vue'

/**
 * Shared loading/error state and DMN XML fetching for the DMN components.
 * Mirrors the structure of the sister addon (slidev-addon-bpmn) so both
 * code bases stay easy to read side by side.
 */
export function useDmn() {
  const loading = ref(true)
  const error = ref<string | null>(null)

  async function fetchDmnXml(path: string): Promise<string> {
    const url = new URL(path, window.location.origin + import.meta.env.BASE_URL).href
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch DMN file: ${response.status}`)
    }
    return response.text()
  }

  async function withLoading<T>(fn: () => Promise<T>): Promise<T | undefined> {
    loading.value = true
    error.value = null
    try {
      return await fn()
    } catch (err) {
      error.value = `Failed to load DMN: ${err instanceof Error ? err.message : String(err)}`
      console.error('DMN loading error:', err)
      return undefined
    } finally {
      loading.value = false
    }
  }

  return { loading, error, fetchDmnXml, withLoading }
}
