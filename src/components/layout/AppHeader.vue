<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue'
import { RouterLink } from 'vue-router'

import { THEME_COLORS, type SiteThemeColor } from '@/types/theme'

interface Props {
  theme: SiteThemeColor
  isDark: boolean
  dyslexia?: boolean
}

withDefaults(defineProps<Props>(), { dyslexia: false })

const emit = defineEmits<{
  'update:theme': [theme: SiteThemeColor]
  'toggle-mode': []
  'toggle-dyslexia': []
}>()

const themeDetails = useTemplateRef<HTMLDetailsElement>('themeDetails')

function closeThemeMenu() {
  themeDetails.value?.removeAttribute('open')
}

function selectTheme(color: SiteThemeColor) {
  emit('update:theme', color)
  closeThemeMenu()
}

function handlePointerDown(event: PointerEvent) {
  const details = themeDetails.value
  if (details?.open && !details.contains(event.target as Node)) closeThemeMenu()
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && themeDetails.value?.open) closeThemeMenu()
}

onMounted(() => {
  document.addEventListener('pointerdown', handlePointerDown)
  document.addEventListener('keydown', handleKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handlePointerDown)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <header class="border-b border-border">
    <div class="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-2 px-4 py-3">
      <RouterLink
        to="/"
        class="mr-auto flex items-center gap-2 text-lg font-semibold text-foreground no-underline hover:text-primary"
      >
        <img src="/img/logo.png" alt="" aria-hidden="true" class="h-7 w-7 rounded-sm" />
        Infinity QRCode
      </RouterLink>

      <nav aria-label="Main" class="order-3 flex w-full items-center gap-1 sm:order-none sm:w-auto">
        <RouterLink to="/" class="it-nav-link">Generate</RouterLink>
        <RouterLink to="/learn" class="it-nav-link">Learn</RouterLink>
      </nav>

      <details ref="themeDetails" class="relative order-2 sm:order-none">
        <summary class="it-nav-link">
          Theme
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="m2 4 4 4 4-4" />
          </svg>
        </summary>
        <div
          class="absolute right-0 z-20 mt-2 flex w-44 flex-col gap-1 border border-border bg-background p-2 shadow-md"
        >
          <button
            v-for="color in THEME_COLORS"
            :key="color.value"
            type="button"
            class="it-nav-link w-full justify-start"
            :class="{ 'text-primary font-semibold': theme === color.value }"
            :aria-pressed="theme === color.value"
            @click="selectTheme(color.value)"
          >
            <span class="w-4" aria-hidden="true">{{ theme === color.value ? '✓' : '' }}</span>
            {{ color.label }}
          </button>
        </div>
      </details>

      <button
        type="button"
        class="it-btn it-btn-sm it-btn-icon order-2 sm:order-none"
        :class="dyslexia ? 'it-btn-primary' : 'it-btn-secondary'"
        :aria-label="dyslexia ? 'Disable dyslexia-friendly font' : 'Enable dyslexia-friendly font'"
        :aria-pressed="dyslexia"
        :title="dyslexia ? 'Disable dyslexia-friendly font' : 'Enable dyslexia-friendly font'"
        @click="$emit('toggle-dyslexia')"
      >
        <span aria-hidden="true" class="text-sm font-semibold">aA</span>
      </button>

      <button
        type="button"
        class="it-btn it-btn-ghost it-btn-sm order-2 sm:order-none"
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
