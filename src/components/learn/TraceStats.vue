<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { LearnPhase, TraceMetadata } from '@/types/learn'

const { t } = useI18n()

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
  /** Message catalog key of the term. */
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
    { label: 'learn.stats.terms.version', value: metadata.version, state: 'normal' },
    {
      label: 'learn.stats.terms.size',
      value: `${metadata.size}×${metadata.size}`,
      state: 'normal',
    },
    {
      label: 'learn.stats.terms.level',
      value: metadata.level,
      state: levelActive ? 'active' : 'normal',
    },
    { label: 'learn.stats.terms.segments', value: metadata.segments, state: 'normal' },
    {
      label: 'learn.stats.terms.blocks',
      value: codewordsRevealed ? metadata.blocks : '?',
      state: state(codewordsRevealed, codewordsActive),
    },
    {
      label: 'learn.stats.terms.dataCodewords',
      value: codewordsRevealed ? metadata.dataCodewords : '?',
      state: state(codewordsRevealed, codewordsActive),
    },
    {
      label: 'learn.stats.terms.eccPerBlock',
      value: codewordsRevealed ? metadata.eccPerBlock : '?',
      state: state(codewordsRevealed, codewordsActive),
    },
    {
      label: 'learn.stats.terms.totalCodewords',
      value: codewordsRevealed ? metadata.totalCodewords : '?',
      state: state(codewordsRevealed, codewordsActive),
    },
    {
      label: 'learn.stats.terms.dataModules',
      value: codewordsRevealed ? metadata.dataModules : '?',
      state: state(codewordsRevealed, codewordsActive),
    },
    {
      label: 'learn.stats.terms.mask',
      value: maskRevealed ? metadata.mask : '?',
      state: state(maskRevealed, maskActive),
    },
  ]
})
</script>

<template>
  <section aria-labelledby="stats-heading" class="stack">
    <h2 id="stats-heading" class="it-h5 panel-title">{{ t('learn.stats.title') }}</h2>

    <dl v-if="metadata" class="trace-facts it-small">
      <template v-for="row in rows" :key="row.label">
        <dt class="it-muted">{{ t(row.label) }}</dt>
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

    <p v-else class="it-small it-muted">{{ t('learn.stats.empty') }}</p>
  </section>
</template>
