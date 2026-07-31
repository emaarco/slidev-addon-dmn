import { describe, it, expect, vi } from 'vitest'
import { useDmn } from '../../composables/useDmn'

describe('useDmn', () => {
  it('starts in a loading state with no error', () => {
    const { loading, error } = useDmn()
    expect(loading.value).toBe(true)
    expect(error.value).toBeNull()
  })

  it('fetchDmnXml returns the response text on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve('<definitions/>') }))
    const { fetchDmnXml } = useDmn()
    await expect(fetchDmnXml('example.dmn')).resolves.toBe('<definitions/>')
    expect(fetch).toHaveBeenCalledOnce()
  })

  it('fetchDmnXml throws with the status on a failed response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }))
    const { fetchDmnXml } = useDmn()
    await expect(fetchDmnXml('missing.dmn')).rejects.toThrow(/404/)
  })

  it('withLoading toggles loading and returns the value on success', async () => {
    const { loading, error, withLoading } = useDmn()
    const result = await withLoading(async () => 42)
    expect(result).toBe(42)
    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it('withLoading captures the error and returns undefined on failure', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { loading, error, withLoading } = useDmn()
    const result = await withLoading(async () => { throw new Error('boom') })
    expect(result).toBeUndefined()
    expect(loading.value).toBe(false)
    expect(error.value).toMatch(/boom/)
  })
})
