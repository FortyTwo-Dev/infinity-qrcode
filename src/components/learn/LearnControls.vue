<script setup lang="ts">
import { computed } from 'vue'

import { ItField, ItOption, ItSelect } from '@components/theme'
import { ERROR_CORRECTION_LEVELS, type ErrorCorrectionLevel } from '@/types/qr'

interface Props {
  level: ErrorCorrectionLevel
  version: number | null
  stride: number
  maskCandidates: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:level': [level: ErrorCorrectionLevel]
  'update:version': [version: number | null]
  'update:stride': [stride: number]
  'update:mask-candidates': [enabled: boolean]
}>()

const level = computed<string>({
  get: () => props.level,
  set: (value) => emit('update:level', value as ErrorCorrectionLevel),
})

const version = computed<string>({
  get: () => (props.version === null ? '' : String(props.version)),
  set: (value) => emit('update:version', value === '' ? null : Number(value)),
})

const stride = computed<string>({
  get: () => String(props.stride),
  set: (value) => emit('update:stride', Number(value)),
})

const maskCandidates = computed<boolean>({
  get: () => props.maskCandidates,
  set: (value) => emit('update:mask-candidates', value),
})
</script>

<template>
  <section aria-labelledby="trace-options-heading" class="flex flex-col gap-4">
    <h2 id="trace-options-heading" class="it-h5 text-lg font-semibold">Trace</h2>

    <fieldset class="it-fieldset-plain">
      <legend class="mb-2 text-sm font-medium">Error correction</legend>
      <div class="it-choice-group it-choice-group-2">
        <label
          v-for="option in ERROR_CORRECTION_LEVELS"
          :key="option.value"
          :for="`trace-level-${option.value}`"
          class="it-choice"
        >
          <input
            :id="`trace-level-${option.value}`"
            v-model="level"
            type="radio"
            name="trace-level"
            :value="option.value"
          />
          <span>{{ option.label }}</span>
        </label>
      </div>
    </fieldset>

    <ItField
      label="Version"
      html-for="trace-version"
      hint="Auto picks the smallest version that fits."
    >
      <ItSelect id="trace-version" v-model="version" aria-label="Version">
        <ItOption value="" text="Auto" />
        <ItOption
          v-for="value in 40"
          :key="value"
          :value="String(value)"
          :text="`Version ${value}`"
        />
      </ItSelect>
    </ItField>

    <ItField label="Detail" html-for="trace-stride" hint="Lower values create more frames.">
      <ItSelect id="trace-stride" v-model="stride" aria-label="Detail">
        <ItOption value="1" text="Every data module" />
        <ItOption value="5" text="Every 5 modules" />
        <ItOption value="10" text="Every 10 modules" />
        <ItOption value="20" text="Every 20 modules" />
        <ItOption value="50" text="Every 50 modules" />
      </ItSelect>
    </ItField>

    <label for="trace-mask-candidates" class="flex items-center gap-2 text-sm">
      <input
        id="trace-mask-candidates"
        v-model="maskCandidates"
        type="checkbox"
        class="h-4 w-4 accent-primary"
      />
      Show the eight mask candidates
    </label>
  </section>
</template>
