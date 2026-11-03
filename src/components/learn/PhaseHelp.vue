<script setup lang="ts">
import { computed } from 'vue'

import { PHASE_INFO } from '@/lib/learn/phases'
import type { LearnPhase } from '@/types/learn'

import SectionHelp from './SectionHelp.vue'

const props = defineProps<{ phase: LearnPhase | null }>()

const info = computed(() => (props.phase ? PHASE_INFO[props.phase] : null))
</script>

<template>
  <SectionHelp v-if="info" label="About this step" :title="info.title">
    <p class="text-sm">{{ info.description }}</p>

    <div v-if="info.detail">
      <h3 class="text-sm font-semibold">Details</h3>
      <p class="mt-1 text-sm">{{ info.detail }}</p>
    </div>

    <div v-if="info.math || info.formula">
      <h3 class="text-sm font-semibold">Math</h3>
      <p v-if="info.math" class="mt-1 text-sm">{{ info.math }}</p>
      <pre
        v-if="info.formula"
        class="mt-2 overflow-auto border border-border bg-secondary p-3 text-xs"
        >{{ info.formula }}</pre>
    </div>
  </SectionHelp>
</template>
