<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import QrCanvas from '@components/qr/QrCanvas.vue'
import { generateQr, loadQrWasm } from '@/composables/useQrWasm'
import { ERROR_CORRECTION_LEVELS, type ErrorCorrectionLevel, type QrMatrixData } from '@/types/qr'

import SectionHelp from './SectionHelp.vue'

const { t } = useI18n()

const SAMPLE = 'neljäkymmentäkaksi'
const TARGET_SIZE = 96

/** Message keys for the error correction levels, indexed by level value. */
const LEVEL_LABELS: Record<ErrorCorrectionLevel, string> = {
  L: 'generator.levels.low',
  M: 'generator.levels.medium',
  Q: 'generator.levels.quartile',
  H: 'generator.levels.high',
}

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
    <p class="text-sm">{{ t('learn.controls.errorCorrectionIntro') }}</p>

    <p v-if="loading" class="text-sm opacity-70">{{ t('learn.controls.generatingExamples') }}</p>
    <p v-else-if="error" class="text-sm text-destructive" role="alert">{{ error }}</p>
    <ul v-else class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <li v-for="example in examples" :key="example.level" class="flex flex-col items-center gap-1">
        <div class="flex min-h-24 w-full items-center justify-center bg-secondary p-2">
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
        <span class="text-xs font-medium">{{ t(LEVEL_LABELS[example.level]) }}</span>
        <span class="text-xs opacity-70">
          v{{ example.data.version }} · {{ example.data.size }}×{{ example.data.size }}
        </span>
      </li>
    </ul>

    <p class="text-xs opacity-70">{{ t('learn.controls.sameContentFour', { sample: SAMPLE }) }}</p>
  </SectionHelp>
</template>
