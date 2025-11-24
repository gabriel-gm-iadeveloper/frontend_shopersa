import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'app': path.resolve(__dirname, './src/app'),
      'components': path.resolve(__dirname, './src/components'),
      'features': path.resolve(__dirname, './src/features'),
      'pages': path.resolve(__dirname, './src/pages'),
      'hooks': path.resolve(__dirname, './src/hooks'),
      'services': path.resolve(__dirname, './src/services'),
      'store': path.resolve(__dirname, './src/store'),
      'styles': path.resolve(__dirname, './src/styles'),
      'utils': path.resolve(__dirname, './src/utils'),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    open: false,
  },
  test: {
    globals: true, // Permite usar describe, it, expect sin importarlos (estilo Jasmine)
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: false,
  },
})
