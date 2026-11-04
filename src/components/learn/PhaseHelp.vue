<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { PHASE_INFO } from '@/lib/learn/phases'
import type { LearnPhase } from '@/types/learn'

import SectionHelp from './SectionHelp.vue'

const { t } = useI18n()

const props = defineProps<{ phase: LearnPhase | null }>()

const info = computed(() => (props.phase ? PHASE_INFO[props.phase] : null))
</script>

<template>
  <SectionHelp
    v-if="info"
    :label="t('learn.panel.aboutStep')"
    :title="t(info.title)"
  >
    <p class="text-sm">{{ t(info.description) }}</p>

    <div v-if="info.detail">
      <h3 class="text-sm font-semibold">{{ t('learn.panel.details') }}</h3>
      <p class="mt-1 text-sm">{{ t(info.detail) }}</p>
    </div>

    <div v-if="info.math || info.formula">
      <h3 class="text-sm font-semibold">{{ t('learn.panel.math') }}</h3>
      <p v-if="info.math" class="mt-1 text-sm">{{ t(info.math) }}</p>
      <pre
        v-if="info.formula"
        class="mt-2 overflow-auto border border-border bg-secondary p-3 text-xs"
        >{{ t(info.formula) }}</pre>
    </div>
  </SectionHelp>
</template>
