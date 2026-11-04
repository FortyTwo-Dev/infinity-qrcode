<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { useI18n } from 'vue-i18n'

import { ItButton } from '@components/theme'

const { t } = useI18n()

const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW()

function close() {
  offlineReady.value = false
  needRefresh.value = false
}
</script>

<template>
  <output
    v-if="offlineReady || needRefresh"
    :aria-label="t('pwa.status')"
    aria-live="polite"
    class="block border-b border-border bg-secondary text-secondary-foreground"
  >
    <div class="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-2 px-4 py-2 text-sm">
      <span class="mr-auto">
        {{ offlineReady ? t('pwa.offlineReady') : t('pwa.needRefresh') }}
      </span>
      <ItButton v-if="needRefresh" size="sm" @click="updateServiceWorker()">
        {{ t('pwa.reload') }}
      </ItButton>
      <ItButton variant="secondary" size="sm" @click="close">{{ t('pwa.close') }}</ItButton>
    </div>
  </output>
</template>
