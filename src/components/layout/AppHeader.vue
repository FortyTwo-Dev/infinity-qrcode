<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { THEME_COLORS, type SiteThemeColor } from '@/types/theme'

interface Props {
  theme: SiteThemeColor
  isDark: boolean
}

defineProps<Props>()

defineEmits<{
  'update:theme': [theme: SiteThemeColor]
  'toggle-mode': []
}>()
</script>

<template>
  <header class="border-b border-secondary">
    <div class="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-4 px-4 py-3">
      <RouterLink to="/" class="mr-auto text-lg font-semibold hover:text-primary">
        Infinity QRCode
      </RouterLink>

      <nav aria-label="Main" class="flex items-center gap-1 text-sm">
        <RouterLink
          to="/"
          class="rounded-sm px-2 py-1 hover:bg-secondary"
          active-class="text-primary"
          exact-active-class="text-primary"
        >
          Generate
        </RouterLink>
        <RouterLink
          to="/learn"
          class="rounded-sm px-2 py-1 hover:bg-secondary"
          active-class="text-primary"
        >
          Learn
        </RouterLink>
      </nav>

      <details class="relative">
        <summary class="cursor-pointer list-none rounded-sm px-2 py-1 text-sm hover:bg-secondary">
          Theme
        </summary>
        <div
          class="absolute right-0 z-20 mt-2 flex w-44 flex-col gap-1 border border-secondary bg-background p-2 shadow-md"
        >
          <button
            v-for="color in THEME_COLORS"
            :key="color.value"
            type="button"
            class="rounded-sm px-2 py-1 text-left text-sm hover:bg-secondary"
            :class="{ 'text-primary': theme === color.value }"
            :aria-pressed="theme === color.value"
            @click="$emit('update:theme', color.value)"
          >
            {{ color.label }}
          </button>
        </div>
      </details>

      <button
        type="button"
        class="rounded-sm px-2 py-1 hover:bg-secondary"
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
