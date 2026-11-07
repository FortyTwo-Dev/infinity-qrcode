<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { PHASE_INFO } from '@/lib/learn/phases'
import type { LearnPhase } from '@/types/learn'

import PhaseHelp from './PhaseHelp.vue'

const { t } = useI18n()

interface Props {
  phase: LearnPhase | null
  bitIndex?: number
  mask?: number
  penalty?: number
}

const props = defineProps<Props>()

const info = computed(() => (props.phase ? PHASE_INFO[props.phase] : null))
</script>

<template>
  <section aria-labelledby="phase-heading" class="flex flex-col gap-3">
    <div class="flex items-center gap-2">
      <h2 id="phase-heading" class="it-h5 m-0 text-lg font-semibold">
        {{ t('learn.panel.title') }}
      </h2>
      <PhaseHelp :phase="phase" />
    </div>

    <div v-if="info" aria-live="polite">
      <h3 class="it-h5 font-medium">{{ t(info.title) }}</h3>
      <p class="mt-1 it-small it-muted">{{ t(info.description) }}</p>

      <dl class="mt-3 grid grid-cols-2 gap-2 it-small">
        <template v-if="bitIndex !== undefined">
          <dt class="it-muted">{{ t('learn.panel.bitIndex') }}</dt>
          <dd>{{ bitIndex }}</dd>
        </template>
        <template v-if="mask !== undefined">
          <dt class="it-muted">{{ t('learn.panel.mask') }}</dt>
          <dd>{{ mask }}</dd>
        </template>
        <template v-if="penalty !== undefined">
          <dt class="it-muted">{{ t('learn.panel.penalty') }}</dt>
          <dd>{{ penalty }}</dd>
        </template>
      </dl>
    </div>

    <p v-else class="it-small it-muted">{{ t('learn.panel.noFrame') }}</p>
  </section>
</template>
