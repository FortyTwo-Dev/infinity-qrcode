<script setup lang="ts">
import { computed } from 'vue'

import { Field, Option, Radio, Select } from '@ui/index'
import type { ErrorCorrectionLevel } from '@/types/qr'

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
    <h2 id="trace-options-heading" class="text-lg font-semibold">Trace</h2>

    <fieldset>
      <legend class="mb-2 text-sm font-medium">Error correction</legend>
      <div class="flex flex-wrap gap-2">
        <Radio id="trace-level-l" v-model="level" name="trace-level" value="L" label="Low" />
        <Radio id="trace-level-m" v-model="level" name="trace-level" value="M" label="Medium" />
        <Radio id="trace-level-q" v-model="level" name="trace-level" value="Q" label="Quartile" />
        <Radio id="trace-level-h" v-model="level" name="trace-level" value="H" label="High" />
      </div>
    </fieldset>

    <Field
      label="Version"
      html-for="trace-version"
      hint="Auto picks the smallest version that fits."
    >
      <Select id="trace-version" v-model="version" aria-label="Version">
        <Option value="" text="Auto" />
        <Option
          v-for="value in 40"
          :key="value"
          :value="String(value)"
          :text="`Version ${value}`"
        />
      </Select>
    </Field>

    <Field label="Detail" html-for="trace-stride" hint="Lower values create more frames.">
      <Select id="trace-stride" v-model="stride" aria-label="Detail">
        <Option value="1" text="Every data module" />
        <Option value="5" text="Every 5 modules" />
        <Option value="10" text="Every 10 modules" />
        <Option value="20" text="Every 20 modules" />
        <Option value="50" text="Every 50 modules" />
      </Select>
    </Field>

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
