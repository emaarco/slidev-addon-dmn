import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    allowedHosts: ['.localhost'],
  },
  optimizeDeps: {
    include: [
      'dmn-js/lib/Viewer',
      'dmn-js/lib/Modeler',
      'dmn-js-properties-panel',
      '@emaarco/dmn-js-simulation',
    ],
  },
})
