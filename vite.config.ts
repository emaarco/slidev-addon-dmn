import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    allowedHosts: ['.localhost'],
  },
  optimizeDeps: {
    include: [
      'dmn-js/lib/Viewer',
    ],
  },
})
