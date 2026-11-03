<script setup lang="ts">
import { Button } from '@ui/index'
import QrCanvas from '@components/qr/QrCanvas.vue'
import type { QrMatrixData, QrOptions } from '@/types/qr'

interface Props {
  data: QrMatrixData | null
  options: QrOptions
  loading?: boolean
  error?: string | null
}

withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
})

defineEmits<{ download: [] }>()
</script>

<template>
  <section aria-labelledby="preview-heading" class="flex flex-col gap-4">
    <div class="flex flex-wrap items-end justify-between gap-2">
      <h2 id="preview-heading" class="text-lg font-semibold">Preview</h2>
      <p v-if="data" class="text-xs opacity-70">
        v{{ data.version }} · {{ data.size }}×{{ data.size }} · mask {{ data.mask }}
      </p>
    </div>

    <output v-if="loading" class="block text-sm" aria-label="QR engine status"
      >Loading QR engine…</output
    >

    <p
      v-else-if="error"
      class="rounded-sm border border-destructive p-3 text-sm text-destructive"
      role="alert"
    >
      {{ error }}
    </p>

    <div
      v-else-if="data"
      class="flex min-h-64 items-center justify-center rounded-sm border border-secondary p-4"
    >
      <QrCanvas
        :matrix="data.matrix"
        :size="data.size"
        :module-size="options.moduleSize"
        :quiet-zone="options.quietZone"
        :dark="options.dark"
        :light="options.light"
        label="Generated QR code"
      />
    </div>

    <p
      v-else
      class="flex min-h-64 items-center justify-center rounded-sm border border-dashed border-secondary p-4 text-center text-sm opacity-70"
    >
      Enter valid content to see the QR code.
    </p>

    <div class="flex flex-wrap items-center gap-2">
      <Button :disabled="!data" @click="$emit('download')">
        Download {{ options.format.toUpperCase() }}
      </Button>
      <slot name="actions" />
    </div>
  </section>
</template>
