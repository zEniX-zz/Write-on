// Standalone static build for the Writeon site.
// No framework plugins: index.html at the root is the entry and ships as-is.
import { defineConfig } from 'vite'
export default defineConfig({
  build: {
    assetsInlineLimit: 0,
    cssCodeSplit: false,
  },
})
