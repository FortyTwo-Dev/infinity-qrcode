<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { ItButton } from '@infinitylib/infinity-theme-vue'

defineProps<{ message: string | null }>()
defineEmits<{ close: [] }>()

const { t } = useI18n()
</script>

<template>
  <output
    v-if="message"
    :aria-label="t('generator.preview.copyStatus')"
    aria-live="polite"
    class="copy-toast"
  >
    <div class="copy-toast-inner it-small">
      <span class="copy-toast-message">{{ message }}</span>
      <ItButton variant="secondary" size="sm" @click="$emit('close')">
        {{ t('common.close') }}
      </ItButton>
    </div>
  </output>
</template>
