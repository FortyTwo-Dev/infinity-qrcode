<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { RouterLink } from 'vue-router'

import { THEME_COLORS, type SiteThemeColor } from '@/types/theme'

interface Props {
  theme: SiteThemeColor
  isDark: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:theme': [theme: SiteThemeColor]
  'toggle-mode': []
}>()

const themeDetails = useTemplateRef<HTMLDetailsElement>('themeDetails')

function selectTheme(color: SiteThemeColor) {
  emit('update:theme', color)
  themeDetails.value?.removeAttribute('open')
}
</script>

<template>
  <header class="border-b border-border">
    <div class="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-2 px-4 py-3">
      <RouterLink to="/" class="it-btn it-btn-ghost mr-auto text-lg font-semibold">
        Infinity QRCode
      </RouterLink>

      <nav aria-label="Main" class="flex items-center gap-1">
        <RouterLink
          to="/"
          class="it-btn it-btn-ghost it-btn-sm"
          active-class="it-btn-primary"
          exact-active-class="it-btn-primary"
        >
          Generate
        </RouterLink>
        <RouterLink to="/learn" class="it-btn it-btn-ghost it-btn-sm" active-class="it-btn-primary">
          Learn
        </RouterLink>
      </nav>

      <details ref="themeDetails" class="relative">
        <summary class="it-btn it-btn-ghost it-btn-sm cursor-pointer list-none">Theme</summary>
        <div
          class="absolute right-0 z-20 mt-2 flex w-44 flex-col gap-1 border border-border bg-background p-2 shadow-md"
        >
          <button
            v-for="color in THEME_COLORS"
            :key="color.value"
            type="button"
            class="it-btn it-btn-ghost it-btn-sm w-full justify-start"
            :class="{ 'it-btn-primary': theme === color.value }"
            :aria-pressed="theme === color.value"
            @click="selectTheme(color.value)"
          >
            {{ color.label }}
          </button>
        </div>
      </details>

      <button
        type="button"
        class="it-btn it-btn-ghost it-btn-sm"
        :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        :aria-pressed="isDark"
        @click="$emit('toggle-mode')"
      >
        <svg
          v-if="isDark"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
          />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <path
            d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"
          />
        </svg>
      </button>
    </div>
  </header>
</template>
