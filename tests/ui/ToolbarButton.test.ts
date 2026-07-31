import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ToolbarButton from '../../shared/ui/ToolbarButton.vue'

describe('ToolbarButton.vue', () => {
  it('renders the label and sets the title', () => {
    const wrapper = mount(ToolbarButton, { props: { title: 'Edit diagram', label: 'Edit' } })
    expect(wrapper.text()).toContain('Edit')
    expect(wrapper.find('button').attributes('title')).toBe('Edit diagram')
  })

  it('omits the label span when no label is given', () => {
    const wrapper = mount(ToolbarButton, { props: { title: 'Close' } })
    expect(wrapper.find('span').exists()).toBe(false)
  })

  it('emits click with the native event', async () => {
    const wrapper = mount(ToolbarButton, { props: { title: 'Save' } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
    expect(wrapper.emitted('click')![0][0]).toBeInstanceOf(MouseEvent)
  })

  it('renders the icon slot', () => {
    const wrapper = mount(ToolbarButton, {
      props: { title: 'Edit' },
      slots: { icon: '<svg class="my-icon" />' },
    })
    expect(wrapper.find('svg.my-icon').exists()).toBe(true)
  })

  it('applies absolute positioning only when a position is provided', () => {
    const plain = mount(ToolbarButton, { props: { title: 'x' } })
    expect(plain.find('button').attributes('style')).not.toContain('position: absolute')

    const positioned = mount(ToolbarButton, { props: { title: 'x', position: { top: '10px', right: '5px' } } })
    const style = positioned.find('button').attributes('style') ?? ''
    expect(style).toContain('position: absolute')
    expect(style).toContain('top: 10px')
    expect(style).toContain('right: 5px')
  })
})
