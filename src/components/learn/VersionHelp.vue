<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import QrCanvas from '@components/qr/QrCanvas.vue'
import { createLearnTrace, loadLearnWasm, readLearnFrame } from '@/composables/useLearnWasm'
import type { QrMatrixData } from '@/types/qr'

import SectionHelp from './SectionHelp.vue'

const { t } = useI18n()

const SAMPLE = '42'
const MODULE_SIZE = 2

interface Example {
  version: number | null
  caption: string
  data: QrMatrixData
}

/** Display label of an example: Auto for a version chosen by the encoder. */
function labelOf(version: number | null): string {
  return version === null
    ? t('learn.controls.auto')
    : t('learn.controls.versionOption', { version })
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
      version,
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
  <SectionHelp
    :label="t('learn.controls.versionHelpLabel')"
    :title="t('learn.controls.version')"
    @open="loadExamples"
  >
    <p class="text-sm">{{ t('learn.controls.versionIntro') }}</p>
    <p class="text-sm">{{ t('learn.controls.versionPadding') }}</p>

    <p v-if="loading" class="text-sm opacity-70">{{ t('learn.controls.generatingExamples') }}</p>
    <p v-else-if="error" class="text-sm text-destructive" role="alert">{{ error }}</p>
    <ul v-else class="grid grid-cols-2 gap-4">
      <li
        v-for="example in examples"
        :key="example.data.version"
        class="flex flex-col items-center gap-1"
      >
        <div class="flex min-h-36 w-full items-center justify-center bg-secondary p-2">
          <QrCanvas
            :matrix="example.data.matrix"
            :size="example.data.size"
            :module-size="MODULE_SIZE"
            :quiet-zone="4"
            dark="#000000"
            light="#ffffff"
            :label="t('learn.controls.exampleAria', { label: labelOf(example.version) })"
          />
        </div>
        <span class="text-xs font-medium">{{ labelOf(example.version) }}</span>
        <span class="text-xs opacity-70">{{ example.caption }}</span>
      </li>
    </ul>

    <p class="text-xs opacity-70">{{ t('learn.controls.sameContentBoth', { sample: SAMPLE }) }}</p>
  </SectionHelp>
</template>
