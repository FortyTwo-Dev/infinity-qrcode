<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { ItButton } from '@components/theme'
import QrCanvas from '@components/qr/QrCanvas.vue'
import type { QrMatrixData, QrOptions } from '@/types/qr'

const { t } = useI18n()

/** Upper bound for the on-screen code, in CSS pixels. */
const PREVIEW_MAX_SIZE = 360

interface Props {
  data: QrMatrixData | null
  options: QrOptions
  loading?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
})

defineEmits<{ download: [] }>()

/**
 * The preview size is independent of the export size: the code always fits the
 * preview area, so changing `moduleSize` never resizes the page.
 */
const displayModuleSize = computed(() => {
  if (!props.data) return 1
  const modules = props.data.size + props.options.quietZone * 2
  return Math.max(1, Math.floor(PREVIEW_MAX_SIZE / modules))
})
</script>

<template>
  <section
    aria-labelledby="preview-heading"
    class="panel preview-shell"
  >
    <div class="preview-header">
      <h2 id="preview-heading" class="it-h5 panel-title">
        {{ t('generator.sections.preview') }}
      </h2>
      <p v-if="data" class="fine-print it-muted">
        {{
          t('generator.preview.meta', { version: data.version, size: data.size, mask: data.mask })
        }}
      </p>
    </div>

    <div class="preview-stage">
      <output v-if="loading" class="it-small" :aria-label="t('generator.preview.status')">
        {{ t('generator.preview.loading') }}
      </output>

      <p
        v-else-if="error"
        class="error-box it-small"
        role="alert"
      >
        {{ error }}
      </p>

      <QrCanvas
        v-else-if="data"
        :matrix="data.matrix"
        :size="data.size"
        :module-size="displayModuleSize"
        :quiet-zone="options.quietZone"
        :dark="options.dark"
        :light="options.light"
        :label="t('generator.preview.canvasLabel')"
      />

      <p v-else class="preview-empty it-small it-muted">{{ t('generator.preview.empty') }}</p>
    </div>

    <div class="preview-actions">
      <ItButton :disabled="!data" @click="$emit('download')">
        {{ t('generator.preview.download', { format: options.format.toUpperCase() }) }}
      </ItButton>
    </div>
  </section>
</template>
