<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

const version = __APP_VERSION__
const year = new Date().getFullYear()

const { t } = useI18n()
</script>

<template>
  <footer class="app-footer">
    <div
      class="app-container footer-inner it-small"
    >
      <p class="footer-credit">© {{ year }} Infinity QRCode</p>

      <nav :aria-label="t('footer.nav')" class="footer-nav">
        <a
          href="https://github.com/FortyTwo-Dev/infinity-qrcode"
          target="_blank"
          rel="noopener noreferrer"
          class="it-link-accent"
        >
          GitHub
        </a>
        <RouterLink to="/credits" class="it-link-accent">{{ t('footer.credits') }}</RouterLink>
        <RouterLink to="/legal" class="it-link-accent">{{ t('footer.legal') }}</RouterLink>
        <RouterLink to="/privacy" class="it-link-accent">{{ t('footer.privacy') }}</RouterLink>
        <span class="it-muted">v{{ version }}</span>
      </nav>
    </div>
  </footer>
</template>
