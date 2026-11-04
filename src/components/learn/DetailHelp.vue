<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { createLearnTrace, loadLearnWasm } from '@/composables/useLearnWasm'

import SectionHelp from './SectionHelp.vue'

const { t } = useI18n()

const SAMPLE = '42'
const STRIDES = [50, 10, 1] as const

interface Row {
  /** Message catalog key of the stride label. */
  key: string
  stride: number
  frames: number
}

const rows = ref<Row[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
let loaded = false

function count(stride: number): number {
  const trace = createLearnTrace(SAMPLE, 'H', null, stride, true)
  try {
    return trace.frame_count()
  } finally {
    trace.free()
  }
}

async function loadCounts() {
  if (loaded || loading.value) return

  loading.value = true
  try {
    await loadLearnWasm()
    rows.value = STRIDES.map((stride) => ({
      key: stride === 1 ? 'learn.controls.everyModule' : 'learn.controls.everyModules',
      stride,
      frames: count(stride),
    }))
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
    :label="t('learn.controls.detailHelpLabel')"
    :title="t('learn.controls.detail')"
    @open="loadCounts"
  >
    <p class="text-sm">{{ t('learn.controls.detailIntro') }}</p>

    <p v-if="loading" class="text-sm opacity-70">{{ t('learn.controls.countingFrames') }}</p>
    <p v-else-if="error" class="text-sm text-destructive" role="alert">{{ error }}</p>
    <dl v-else class="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-sm">
      <template v-for="row in rows" :key="row.stride">
        <dt>{{ t(row.key, { count: row.stride }) }}</dt>
        <dd class="text-right font-medium">
          {{ t('learn.controls.frameCount', { count: row.frames }) }}
        </dd>
      </template>
    </dl>

    <p class="text-xs opacity-70">{{ t('learn.controls.sameContentThree', { sample: SAMPLE }) }}</p>
  </SectionHelp>
</template>
