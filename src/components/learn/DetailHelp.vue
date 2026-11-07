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
    <p class="it-small">{{ t('learn.controls.detailIntro') }}</p>

    <p v-if="loading" class="it-small it-muted">{{ t('learn.controls.countingFrames') }}</p>
    <p v-else-if="error" class="it-small text-danger" role="alert">{{ error }}</p>
    <dl v-else class="detail-grid it-small">
      <template v-for="row in rows" :key="row.stride">
        <dt>{{ t(row.key, { count: row.stride }) }}</dt>
        <dd class="detail-value">
          {{ t('learn.controls.frameCount', { count: row.frames }) }}
        </dd>
      </template>
    </dl>

    <p class="fine-print it-muted">{{ t('learn.controls.sameContentThree', { sample: SAMPLE }) }}</p>
  </SectionHelp>
</template>
