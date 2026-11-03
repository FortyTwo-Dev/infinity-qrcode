<script setup lang="ts">
import { computed } from 'vue'

import { PHASE_INFO } from '@/lib/learn/phases'
import type { LearnPhase } from '@/types/learn'

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
    <h2 id="phase-heading" class="text-lg font-semibold">Phase</h2>

    <div v-if="info" aria-live="polite">
      <h3 class="font-medium">{{ info.title }}</h3>
      <p class="mt-1 text-sm opacity-80">{{ info.description }}</p>

      <dl class="mt-3 grid grid-cols-2 gap-2 text-sm">
        <template v-if="bitIndex !== undefined">
          <dt class="opacity-70">Bit index</dt>
          <dd>{{ bitIndex }}</dd>
        </template>
        <template v-if="mask !== undefined">
          <dt class="opacity-70">Mask</dt>
          <dd>{{ mask }}</dd>
        </template>
        <template v-if="penalty !== undefined">
          <dt class="opacity-70">Penalty</dt>
          <dd>{{ penalty }}</dd>
        </template>
      </dl>
    </div>

    <p v-else class="text-sm opacity-70">No frame selected.</p>
  </section>
</template>
