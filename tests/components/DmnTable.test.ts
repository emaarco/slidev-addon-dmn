import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'

const { mockImportXML, mockOpen, mockGetViews, MockDmnViewer } = vi.hoisted(() => ({
  mockImportXML: vi.fn(),
  mockOpen: vi.fn(),
  mockGetViews: vi.fn(),
  MockDmnViewer: vi.fn(),
}))

vi.mock('dmn-js/lib/Viewer', () => ({
  default: MockDmnViewer,
}))

const { slideEnterCallbacks } = vi.hoisted(() => ({
  slideEnterCallbacks: [] as Array<() => void>,
}))

vi.mock('@slidev/client', () => ({
  onSlideEnter: vi.fn((cb: () => void) => {
    slideEnterCallbacks.push(cb)
  }),
}))

import DmnTable from '../../components/DmnTable.vue'

const TABLE_VIEW = { type: 'decisionTable', element: { id: 'decision1' } }
const TABLE_VIEW_2 = { type: 'decisionTable', element: { id: 'decision2' } }

function mockFetchSuccess(xml = '<definitions></definitions>') {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    text: () => Promise.resolve(xml),
  }))
}

function mockFetchFailure() {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: false,
    status: 404,
  }))
}

function giveContainerDimensions(wrapper: ReturnType<typeof mount>) {
  const containerEl = wrapper.find('div.dmn-table-wrapper').element as HTMLDivElement
  if (containerEl) {
    Object.defineProperty(containerEl, 'clientWidth', { value: 800, configurable: true })
    Object.defineProperty(containerEl, 'clientHeight', { value: 500, configurable: true })
  }
}

describe('DmnTable.vue', () => {
  beforeEach(() => {
    slideEnterCallbacks.length = 0
    mockImportXML.mockClear()
    mockOpen.mockClear()
    mockGetViews.mockClear()
    MockDmnViewer.mockClear()

    mockImportXML.mockResolvedValue(undefined)
    mockOpen.mockResolvedValue(undefined)
    mockGetViews.mockReturnValue([TABLE_VIEW])
    MockDmnViewer.mockImplementation(function () {
      return {
        importXML: mockImportXML,
        getViews: mockGetViews,
        open: mockOpen,
      }
    })

    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('shows loading state initially', async () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})))
    const wrapper = mount(DmnTable, { props: { dmnFilePath: 'test.dmn' } })
    giveContainerDimensions(wrapper)
    await new Promise(resolve => setTimeout(resolve, 50))
    await nextTick()
    expect(wrapper.text()).toContain('Loading DMN decision table...')
  })

  it('defaults containerHeight to 500px when height is auto', () => {
    mockFetchSuccess()
    const wrapper = mount(DmnTable, { props: { dmnFilePath: 'test.dmn' } })
    const outerDiv = wrapper.find('div').element as HTMLDivElement
    expect(outerDiv.style.height).toBe('500px')
  })

  it('uses provided height for containerHeight', () => {
    mockFetchSuccess()
    const wrapper = mount(DmnTable, {
      props: { dmnFilePath: 'test.dmn', height: '700px' },
    })
    const outerDiv = wrapper.find('div').element as HTMLDivElement
    expect(outerDiv.style.height).toBe('700px')
  })

  it('renders successfully when container has dimensions', async () => {
    mockFetchSuccess()
    const wrapper = mount(DmnTable, { props: { dmnFilePath: 'test.dmn' } })
    giveContainerDimensions(wrapper)

    await new Promise(resolve => setTimeout(resolve, 50))
    await flushPromises()

    expect(mockImportXML).toHaveBeenCalled()
    expect(mockOpen).toHaveBeenCalledWith(TABLE_VIEW)
  })

  it('prevents duplicate rendering on second onSlideEnter call', async () => {
    mockFetchSuccess()
    const wrapper = mount(DmnTable, { props: { dmnFilePath: 'test.dmn' } })
    giveContainerDimensions(wrapper)

    await new Promise(resolve => setTimeout(resolve, 50))
    await flushPromises()

    const callCountAfterMount = MockDmnViewer.mock.calls.length

    const lastCallback = slideEnterCallbacks[slideEnterCallbacks.length - 1]
    if (lastCallback) {
      await lastCallback()
      await flushPromises()
    }

    expect(MockDmnViewer.mock.calls.length).toBe(callCountAfterMount)
  })

  it('allows retry after error', async () => {
    mockFetchFailure()
    const wrapper = mount(DmnTable, { props: { dmnFilePath: 'test.dmn' } })
    giveContainerDimensions(wrapper)

    await new Promise(resolve => setTimeout(resolve, 50))
    await flushPromises()

    expect(wrapper.text()).toContain('Failed to load DMN')

    mockFetchSuccess()

    const lastCallback = slideEnterCallbacks[slideEnterCallbacks.length - 1]
    if (lastCallback) {
      await lastCallback()
      await new Promise(resolve => setTimeout(resolve, 50))
      await flushPromises()
    }

    expect(mockImportXML).toHaveBeenCalled()
  })

  it('shows error on fetch failure', async () => {
    mockFetchFailure()
    const wrapper = mount(DmnTable, { props: { dmnFilePath: 'missing.dmn' } })
    giveContainerDimensions(wrapper)

    await new Promise(resolve => setTimeout(resolve, 50))
    await flushPromises()

    expect(wrapper.text()).toContain('Failed to load DMN')
  })

  it('shows error when no decision table found', async () => {
    mockGetViews.mockReturnValue([{ type: 'drd' }])
    mockFetchSuccess()
    const wrapper = mount(DmnTable, { props: { dmnFilePath: 'test.dmn' } })
    giveContainerDimensions(wrapper)

    await new Promise(resolve => setTimeout(resolve, 50))
    await flushPromises()

    expect(wrapper.text()).toContain('Failed to load DMN')
  })

  it('opens specific decision table by decisionId', async () => {
    mockGetViews.mockReturnValue([TABLE_VIEW, TABLE_VIEW_2])
    mockFetchSuccess()
    const wrapper = mount(DmnTable, {
      props: { dmnFilePath: 'test.dmn', decisionId: 'decision2' },
    })
    giveContainerDimensions(wrapper)

    await new Promise(resolve => setTimeout(resolve, 50))
    await flushPromises()

    expect(mockOpen).toHaveBeenCalledWith(TABLE_VIEW_2)
  })

  it('opens first decision table when no decisionId provided', async () => {
    mockGetViews.mockReturnValue([TABLE_VIEW, TABLE_VIEW_2])
    mockFetchSuccess()
    const wrapper = mount(DmnTable, { props: { dmnFilePath: 'test.dmn' } })
    giveContainerDimensions(wrapper)

    await new Promise(resolve => setTimeout(resolve, 50))
    await flushPromises()

    expect(mockOpen).toHaveBeenCalledWith(TABLE_VIEW)
  })
})
