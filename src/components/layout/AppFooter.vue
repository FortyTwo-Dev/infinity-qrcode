<script setup lang="ts">
import { RouterLink } from 'vue-router'

const version = __APP_VERSION__
const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-border">
    <div
      class="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-4 text-sm leading-5"
    >
      <p class="m-0 font-semibold leading-5">© {{ year }} Infinity QRCode</p>

      <nav aria-label="Footer" class="flex flex-wrap items-center gap-x-3 gap-y-1">
        <a
          href="https://github.com/FortyTwo-Dev/infinity-qrcode"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-primary"
        >
          GitHub
        </a>
        <RouterLink to="/credits" class="hover:text-primary">Credits</RouterLink>
        <RouterLink to="/legal" class="hover:text-primary">Mentions légales</RouterLink>
        <RouterLink to="/privacy" class="hover:text-primary">Confidentialité</RouterLink>
        <span class="opacity-70">v{{ version }}</span>
      </nav>
    </div>
  </footer>
</template>
