<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'

import { Button } from '@ui/index'

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
    class="fixed right-4 bottom-4 z-50 block max-w-sm rounded-sm border border-secondary bg-background p-3 shadow-md"
    aria-live="polite"
  >
    <span class="block text-sm">
      {{
        offlineReady ? 'Ready to work offline.' : 'A new version is available. Reload to update.'
      }}
    </span>
    <span class="mt-2 flex gap-2">
      <Button v-if="needRefresh" @click="updateServiceWorker()">Reload</Button>
      <Button variant="secondary" @click="close">Close</Button>
    </span>
  </output>
</template>
