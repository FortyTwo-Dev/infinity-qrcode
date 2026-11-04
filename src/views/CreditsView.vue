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
  <div class="mx-auto w-full max-w-3xl px-4 py-8">
    <h1 class="text-3xl font-semibold sm:text-4xl">{{ t('credits.title') }}</h1>
    <p class="mt-2 max-w-2xl text-sm opacity-80">{{ t('credits.intro') }}</p>

    <ul class="mt-8 flex flex-col gap-5">
      <li
        v-for="[name, role, license, href] in CREDITS"
        :key="name"
        class="border-l-2 border-border pl-4"
      >
        <a
          :href="href"
          target="_blank"
          rel="noopener noreferrer"
          class="font-semibold underline decoration-primary it-link-accent"
        >
          {{ name }}
        </a>
        <p class="m-0 mt-1 text-sm">{{ t(role) }}</p>
        <p class="m-0 mt-1 text-xs opacity-70">{{ license }}</p>
      </li>
    </ul>
  </div>
</template>
