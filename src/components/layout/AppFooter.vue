<script setup lang="ts">
const version = __APP_VERSION__
</script>

<template>
  <footer class="border-t border-secondary">
    <div
      class="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-1 px-4 py-4 text-center text-sm"
    >
      <p class="font-semibold">Infinity QRCode - {{ new Date().getFullYear() }}</p>
      <p>
        <a
          href="https://github.com/FortyTwo-Dev/infinity-qrcode"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-primary"
        >
          GitHub
        </a>
        <span aria-hidden="true"> · </span>
        <span>v{{ version }}</span>
      </p>
    </div>
  </footer>
</template>
