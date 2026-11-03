<script setup lang="ts">
import { RouterView } from 'vue-router'

import AppFooter from '@components/layout/AppFooter.vue'
import AppHeader from '@components/layout/AppHeader.vue'
import PwaPrompt from '@components/layout/PwaPrompt.vue'
import { useDyslexiaFont } from '@/composables/useDyslexiaFont'
import { useTheme } from '@/composables/useTheme'

const { theme, isDark, toggleMode, setThemeColor } = useTheme()
const { dyslexia, toggleDyslexia } = useDyslexiaFont()
</script>

<template>
  <div class="flex min-h-screen flex-col bg-background text-foreground">
    <AppHeader
      :theme="theme"
      :is-dark="isDark"
      :dyslexia="dyslexia"
      @update:theme="setThemeColor"
      @toggle-mode="toggleMode"
      @toggle-dyslexia="toggleDyslexia"
    />
    <PwaPrompt />
    <main class="flex-1">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>
