<script setup lang="ts">
import { ref } from 'vue'

import QrCanvas from '@components/qr/QrCanvas.vue'
import { generateQr, loadQrWasm } from '@/composables/useQrWasm'
import { ERROR_CORRECTION_LEVELS, type ErrorCorrectionLevel, type QrMatrixData } from '@/types/qr'

import SectionHelp from './SectionHelp.vue'

const SAMPLE = 'neljäkymmentäkaksi'
const TARGET_SIZE = 96

interface Example {
  level: ErrorCorrectionLevel
  label: string
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
    examples.value = ERROR_CORRECTION_LEVELS.map(({ value, label }) => ({
      level: value,
      label,
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
  <SectionHelp label="About error correction" title="Error correction" @open="loadExamples">
    <p class="text-sm">
      Error correction adds redundant modules so a damaged code can still be read. A higher level
      survives more damage, but the same content needs more modules.
    </p>

    <p v-if="loading" class="text-sm opacity-70">Generating examples…</p>
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
            :label="`QR code at level ${example.level}`"
          />
        </div>
        <span class="text-xs font-medium">{{ example.label }}</span>
        <span class="text-xs opacity-70">
          v{{ example.data.version }} · {{ example.data.size }}×{{ example.data.size }}
        </span>
      </li>
    </ul>

    <p class="text-xs opacity-70">Same content for the four codes: {{ SAMPLE }}.</p>
  </SectionHelp>
</template>
