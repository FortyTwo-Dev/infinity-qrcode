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
  <div
    v-if="offlineReady || needRefresh"
    class="fixed right-4 bottom-4 z-50 max-w-sm rounded-sm border border-secondary bg-background p-3 shadow-md"
    role="status"
    aria-live="polite"
  >
    <p class="text-sm">
      {{
        offlineReady ? 'Ready to work offline.' : 'A new version is available. Reload to update.'
      }}
    </p>
    <div class="mt-2 flex gap-2">
      <Button v-if="needRefresh" @click="updateServiceWorker()">Reload</Button>
      <Button variant="secondary" @click="close">Close</Button>
    </div>
  </div>
</template>
