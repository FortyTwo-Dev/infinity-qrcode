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
    class="fixed right-4 bottom-4 z-50 block max-w-sm rounded-sm border border-border bg-background p-3 shadow-md"
    aria-live="polite"
  >
    <span class="block text-sm">
      {{
        offlineReady ? 'Ready to work offline.' : 'A new version is available. Reload to update.'
      }}
    </span>
    <span class="mt-2 flex gap-2">
      <ItButton v-if="needRefresh" @click="updateServiceWorker()">Reload</ItButton>
      <ItButton variant="secondary" @click="close">Close</ItButton>
    </span>
  </output>
</template>
