<script setup lang="ts">
import { RouterView } from 'vue-router'

import AppFooter from '@components/layout/AppFooter.vue'
import AppHeader from '@components/layout/AppHeader.vue'
import PwaPrompt from '@components/layout/PwaPrompt.vue'
import { useDyslexiaFont } from '@/composables/useDyslexiaFont'
import { useLocale } from '@/composables/useLocale'
import { useTheme } from '@/composables/useTheme'

const { isDark, toggleMode } = useTheme()
const { dyslexia, toggleDyslexia } = useDyslexiaFont()
const { locale, toggleLocale } = useLocale()
</script>

<template>
  <div class="app-shell">
    <AppHeader
      :is-dark="isDark"
      :dyslexia="dyslexia"
      :locale="locale"
      @toggle-mode="toggleMode"
      @toggle-dyslexia="toggleDyslexia"
      @toggle-locale="toggleLocale"
    />
    <PwaPrompt />
    <main class="app-main">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>
