<script setup lang="ts">
import { ref } from 'vue'

import { createLearnTrace, loadLearnWasm } from '@/composables/useLearnWasm'

import SectionHelp from './SectionHelp.vue'

const SAMPLE = '42'
const STRIDES = [
  { stride: 50, label: 'Every 50 modules' },
  { stride: 10, label: 'Every 10 modules' },
  { stride: 1, label: 'Every data module' },
]

interface Row {
  label: string
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
    rows.value = STRIDES.map(({ stride, label }) => ({ label, frames: count(stride) }))
    loaded = true
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <SectionHelp label="About the detail level" title="Detail" @open="loadCounts">
    <p class="text-sm">
      Detail changes how many frames the replay contains, not the final code. A lower value shows
      more intermediate steps, so the construction is slower but more detailed.
    </p>

    <p v-if="loading" class="text-sm opacity-70">Counting frames…</p>
    <p v-else-if="error" class="text-sm text-destructive" role="alert">{{ error }}</p>
    <dl v-else class="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-sm">
      <template v-for="row in rows" :key="row.label">
        <dt>{{ row.label }}</dt>
        <dd class="text-right font-medium">{{ row.frames }} frames</dd>
      </template>
    </dl>

    <p class="text-xs opacity-70">Same content for the three counts: {{ SAMPLE }}.</p>
  </SectionHelp>
</template>
