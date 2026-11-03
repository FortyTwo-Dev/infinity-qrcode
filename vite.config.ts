import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

import packageJson from './package.json' with { type: 'json' }

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      workbox: {
        globPatterns: ['**/*{js,css,html,ico,png,svg,wasm,woff,woff2,ttf}'],
      },
      manifest: {
        name: 'Infinity QRCode',
        short_name: 'IQRCode',
        description: 'Generate QR codes and learn how they are built.',
        theme_color: '#8ec5ff',
        background_color: '#fbfbfe',
        icons: [
          {
            src: '/img/qrcode.png',
            sizes: '200x200',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/favicon.ico',
            sizes: 'any',
            type: 'image/x-icon',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['iqrcode-wasm', 'iqrcode-learn-wasm'],
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
})
