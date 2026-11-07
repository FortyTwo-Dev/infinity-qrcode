<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

import type { Locale } from '@/i18n'

interface Props {
  isDark: boolean
  dyslexia?: boolean
  locale?: Locale
}

withDefaults(defineProps<Props>(), { dyslexia: false, locale: 'en' })

defineEmits<{
  'toggle-mode': []
  'toggle-dyslexia': []
  'toggle-locale': []
}>()

const { t } = useI18n()
</script>

<template>
  <header class="app-header">
    <div class="app-container header-inner">
      <RouterLink
        to="/"
        class="header-brand it-link-accent"
      >
        <img src="/img/logo.png" alt="" aria-hidden="true" class="header-logo" />
        Infinity QRCode
      </RouterLink>

      <nav :aria-label="t('header.nav')" class="header-nav">
        <RouterLink to="/" class="it-nav-link">{{ t('header.generate') }}</RouterLink>
        <RouterLink to="/learn" class="it-nav-link">{{ t('header.learn') }}</RouterLink>
      </nav>

      <button
        type="button"
        class="it-btn it-btn-ghost it-btn-sm header-button"
        :aria-label="t('header.switchLanguage')"
        @click="$emit('toggle-locale')"
      >
        <span aria-hidden="true" class="it-small header-label">{{ locale === 'en' ? 'FR' : 'EN' }}</span>
      </button>

      <button
        type="button"
        class="it-btn it-btn-sm it-btn-icon header-button"
        :class="dyslexia ? 'it-btn-primary' : 'it-btn-secondary'"
        :aria-label="dyslexia ? t('header.dyslexiaOff') : t('header.dyslexiaOn')"
        :aria-pressed="dyslexia"
        :title="dyslexia ? t('header.dyslexiaOff') : t('header.dyslexiaOn')"
        @click="$emit('toggle-dyslexia')"
      >
        <span aria-hidden="true" class="it-small header-label">aA</span>
      </button>

      <button
        type="button"
        class="it-btn it-btn-ghost it-btn-sm header-button"
        :aria-label="isDark ? t('header.switchToLight') : t('header.switchToDark')"
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
