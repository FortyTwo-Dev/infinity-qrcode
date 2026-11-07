import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

import packageJson from './package.json' with { type: 'json' }

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
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
        theme_color: '#ffdf00',
        background_color: '#fbfbfe',
        icons: [
          {
            src: '/img/logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/img/logo-mono.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'monochrome',
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
