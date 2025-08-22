import { fileURLToPath, URL } from 'node:url'

import packageJson from './package.json';

import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      workbox: {
        globPatterns: ['**/*{js,css,html,ico,png,svg}'],
      },
      manifest: {
        name: 'Infinity QRCode',
        short_name: 'IQRCode',
        description: 'Create QR codes effortlessly with this free, simple, and open-source tool.',
        theme_color: '#8ec5ff',
        background_color: '#fbfbfe'
      }
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@ui': fileURLToPath(new URL('./src/components/ui', import.meta.url)),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
})
