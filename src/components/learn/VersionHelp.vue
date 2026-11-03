<script setup lang="ts">
import { ref } from 'vue'

import QrCanvas from '@components/qr/QrCanvas.vue'
import { createLearnTrace, loadLearnWasm, readLearnFrame } from '@/composables/useLearnWasm'
import type { QrMatrixData } from '@/types/qr'

import SectionHelp from './SectionHelp.vue'

const SAMPLE = '42'
const MODULE_SIZE = 2

interface Example {
  label: string
  caption: string
  data: QrMatrixData
}

const examples = ref<Example[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
let loaded = false

function build(version: number | null): Example {
  const trace = createLearnTrace(SAMPLE, 'M', version, 50, false)
  try {
    const frame = readLearnFrame(trace, trace.frame_count() - 1)
    return {
      label: version === null ? 'Auto' : `Version ${version}`,
      caption: `v${trace.version()} · ${frame.size}×${frame.size}`,
      data: {
        matrix: frame.matrix,
        size: frame.size,
        version: trace.version(),
        mask: trace.mask(),
      },
    }
  } finally {
    trace.free()
  }
}

async function loadExamples() {
  if (loaded || loading.value) return

  loading.value = true
  try {
    await loadLearnWasm()
    examples.value = [build(null), build(10)]
    loaded = true
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <SectionHelp label="About the version" title="Version" @open="loadExamples">
    <p class="text-sm">
      The version sets the number of modules, from 21×21 for version 1 to 177×177 for version 40.
      Auto picks the smallest version that fits the content.
    </p>
    <p class="text-sm">
      Forcing a larger version keeps the same content but fills the extra capacity with padding. The
      code gets bigger, not more reliable.
    </p>

    <p v-if="loading" class="text-sm opacity-70">Generating examples…</p>
    <p v-else-if="error" class="text-sm text-destructive" role="alert">{{ error }}</p>
    <ul v-else class="grid grid-cols-2 gap-4">
      <li v-for="example in examples" :key="example.label" class="flex flex-col items-center gap-1">
        <div class="flex min-h-36 w-full items-center justify-center bg-secondary p-2">
          <QrCanvas
            :matrix="example.data.matrix"
            :size="example.data.size"
            :module-size="MODULE_SIZE"
            :quiet-zone="4"
            dark="#000000"
            light="#ffffff"
            :label="`QR code ${example.label}`"
          />
        </div>
        <span class="text-xs font-medium">{{ example.label }}</span>
        <span class="text-xs opacity-70">{{ example.caption }}</span>
      </li>
    </ul>

    <p class="text-xs opacity-70">Same content for both codes: {{ SAMPLE }}.</p>
  </SectionHelp>
</template>
