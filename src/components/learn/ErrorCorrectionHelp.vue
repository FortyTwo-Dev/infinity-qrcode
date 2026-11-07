<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import QrCanvas from '@components/qr/QrCanvas.vue'
import { generateQr, loadQrWasm } from '@/composables/useQrWasm'
import { LEVEL_LABELS } from '@/i18n/keys'
import { ERROR_CORRECTION_LEVELS, type ErrorCorrectionLevel, type QrMatrixData } from '@/types/qr'

import SectionHelp from './SectionHelp.vue'

const { t } = useI18n()

const SAMPLE = 'neljäkymmentäkaksi'
const TARGET_SIZE = 96


interface Example {
  level: ErrorCorrectionLevel
  data: QrMatrixData
}

const examples = ref<Example[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
let loaded = false

async function loadExamples() {
  if (loaded || loading.value) return

  loading.value = true
  try {
    await loadQrWasm()
    examples.value = ERROR_CORRECTION_LEVELS.map(({ value }) => ({
      level: value,
      data: generateQr(SAMPLE, value),
    }))
    loaded = true
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause)
  } finally {
    loading.value = false
  }
}

function previewModuleSize(data: QrMatrixData): number {
  return Math.max(1, Math.floor(TARGET_SIZE / (data.size + 8)))
}
</script>

<template>
  <SectionHelp
    :label="t('learn.controls.errorCorrectionHelpLabel')"
    :title="t('learn.controls.errorCorrection')"
    @open="loadExamples"
  >
    <p class="it-small">{{ t('learn.controls.errorCorrectionIntro') }}</p>

    <p v-if="loading" class="it-small it-muted">{{ t('learn.controls.generatingExamples') }}</p>
    <p v-else-if="error" class="it-small text-destructive" role="alert">{{ error }}</p>
    <ul v-else class="tile-grid tile-grid-4">
      <li v-for="example in examples" :key="example.level" class="tile">
        <div class="tile-stage tile-stage-sm">
          <QrCanvas
            :matrix="example.data.matrix"
            :size="example.data.size"
            :module-size="previewModuleSize(example.data)"
            :quiet-zone="4"
            dark="#000000"
            light="#ffffff"
            :label="t('learn.controls.exampleLabel', { level: example.level })"
          />
        </div>
        <span class="tile-label">{{ t(LEVEL_LABELS[example.level]) }}</span>
        <span class="fine-print it-muted">
          v{{ example.data.version }} · {{ example.data.size }}×{{ example.data.size }}
        </span>
      </li>
    </ul>

    <p class="fine-print it-muted">{{ t('learn.controls.sameContentFour', { sample: SAMPLE }) }}</p>
  </SectionHelp>
</template>
