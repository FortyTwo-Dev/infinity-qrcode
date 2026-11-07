<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import type { Credit } from '@/types/credits'

const CREDITS: readonly Credit[] = [
  ['iqrcode', 'credits.roles.iqrcode', 'MIT or Apache-2.0', 'https://github.com/InfinityLib/infinity-qrcode'],
  ['Vue.js', 'credits.roles.vue', 'MIT', 'https://vuejs.org'],
  ['Vue Router', 'credits.roles.vueRouter', 'MIT', 'https://router.vuejs.org'],
  ['Vite', 'credits.roles.vite', 'MIT', 'https://vite.dev'],
  ['Tailwind CSS', 'credits.roles.tailwind', 'MIT', 'https://tailwindcss.com'],
  ['vite-plugin-pwa', 'credits.roles.vitePwa', 'MIT', 'https://vite-pwa-org.netlify.app'],
  ['Workbox', 'credits.roles.workbox', 'MIT', 'https://developer.chrome.com/docs/workbox'],
  [
    'Space Grotesk',
    'credits.roles.spaceGrotesk',
    'SIL Open Font License 1.1',
    'https://github.com/floriankarsten/space-grotesk',
  ],
  [
    'OpenDyslexic',
    'credits.roles.openDyslexic',
    'Bitstream Vera license',
    'https://github.com/antijingoist/open-dyslexic',
  ],
]

const { t } = useI18n()
</script>

<template>
  <div class="app-container narrow-page page-body">
    <h1 class="page-title">{{ t('credits.title') }}</h1>
    <p class="page-tagline lede it-small it-muted">{{ t('credits.intro') }}</p>

    <ul class="credits-list">
      <li
        v-for="[name, role, license, href] in CREDITS"
        :key="name"
        class="credits-entry"
      >
        <a
          :href="href"
          target="_blank"
          rel="noopener noreferrer"
          class="credits-link it-link-accent"
        >
          {{ name }}
        </a>
        <p class="entry-line it-small">{{ t(role) }}</p>
        <p class="entry-line fine-print it-muted">{{ license }}</p>
      </li>
    </ul>
  </div>
</template>
