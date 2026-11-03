<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'

import { ItButton } from '@components/theme'

const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW()

function close() {
  offlineReady.value = false
  needRefresh.value = false
}
</script>

<template>
  <output
    v-if="offlineReady || needRefresh"
    aria-label="Application update status"
    aria-live="polite"
    class="block border-b border-border bg-secondary text-secondary-foreground"
  >
    <div class="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-2 px-4 py-2 text-sm">
      <span class="mr-auto">
        {{
          offlineReady ? 'Ready to work offline.' : 'A new version is available. Reload to update.'
        }}
      </span>
      <ItButton v-if="needRefresh" size="sm" @click="updateServiceWorker()">Reload</ItButton>
      <ItButton variant="secondary" size="sm" @click="close">Close</ItButton>
    </div>
  </output>
</template>
