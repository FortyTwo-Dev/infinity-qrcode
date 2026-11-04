<script setup lang="ts">
import { computed } from 'vue'

import type { LearnPhase, TraceMetadata } from '@/types/learn'

interface Props {
  metadata: TraceMetadata | null
  phase: LearnPhase | null
}

const props = defineProps<Props>()

const PHASE_ORDER: LearnPhase[] = [
  'empty',
  'finders',
  'timing',
  'alignment',
  'version_info',
  'format_reserved',
  'data_placement',
  'mask_candidate',
  'mask_chosen',
  'format_info',
  'final',
]

type RowState = 'unknown' | 'normal' | 'active'

function state(revealed: boolean, active: boolean): RowState {
  if (!revealed) return 'unknown'
  return active ? 'active' : 'normal'
}

interface Row {
  label: string
  value: string | number
  state: RowState
}

/** A value appears when its concept enters the trace, and is accented while the
 * current phase produces it. */
const rows = computed<Row[]>(() => {
  const metadata = props.metadata
  if (!metadata) return []

  const index = props.phase ? PHASE_ORDER.indexOf(props.phase) : -1
  const codewordsRevealed = index >= PHASE_ORDER.indexOf('data_placement')
  const maskRevealed = index >= PHASE_ORDER.indexOf('mask_chosen')

  const codewordsActive = props.phase === 'data_placement'
  const maskActive = props.phase === 'mask_chosen' || props.phase === 'format_info'
  const levelActive = props.phase === 'format_info'

  return [
    { label: 'Version', value: metadata.version, state: 'normal' },
    { label: 'Size', value: `${metadata.size}×${metadata.size}`, state: 'normal' },
    { label: 'Level', value: metadata.level, state: levelActive ? 'active' : 'normal' },
    { label: 'Segments', value: metadata.segments, state: 'normal' },
    {
      label: 'Blocks',
      value: codewordsRevealed ? metadata.blocks : '?',
      state: state(codewordsRevealed, codewordsActive),
    },
    {
      label: 'Data codewords',
      value: codewordsRevealed ? metadata.dataCodewords : '?',
      state: state(codewordsRevealed, codewordsActive),
    },
    {
      label: 'ECC per block',
      value: codewordsRevealed ? metadata.eccPerBlock : '?',
      state: state(codewordsRevealed, codewordsActive),
    },
    {
      label: 'Total codewords',
      value: codewordsRevealed ? metadata.totalCodewords : '?',
      state: state(codewordsRevealed, codewordsActive),
    },
    {
      label: 'Data modules',
      value: codewordsRevealed ? metadata.dataModules : '?',
      state: state(codewordsRevealed, codewordsActive),
    },
    {
      label: 'Mask',
      value: maskRevealed ? metadata.mask : '?',
      state: state(maskRevealed, maskActive),
    },
  ]
})
</script>

<template>
  <section aria-labelledby="stats-heading" class="flex flex-col gap-3">
    <h2 id="stats-heading" class="it-h5 text-lg font-semibold">QR code</h2>

    <dl v-if="metadata" class="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
      <template v-for="row in rows" :key="row.label">
        <dt class="opacity-70">{{ row.label }}</dt>
        <dd
          :data-state="row.state"
          :class="{
            'it-mark': row.state === 'active',
            'opacity-50': row.state === 'unknown',
          }"
        >
          {{ row.value }}
        </dd>
      </template>
    </dl>

    <p v-else class="text-sm opacity-70">Build a trace to see its metadata.</p>
  </section>
</template>
