import type { Directive } from 'vue'
import * as echarts from 'echarts'

export const vEchartsResize: Directive<HTMLElement> = {
  mounted(el: HTMLElement) {
    const observer = new ResizeObserver(() => {
      const instance = echarts.getInstanceByDom(el)
      if (instance && !instance.isDisposed()) {
        instance.resize()
      }
    })
    observer.observe(el)
    ;(el as any).__echartsResizeObserver = observer
  },

  unmounted(el: HTMLElement) {
    const observer = (el as any).__echartsResizeObserver as ResizeObserver | undefined
    observer?.disconnect()
  },
}
