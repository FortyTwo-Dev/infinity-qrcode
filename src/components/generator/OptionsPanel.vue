<script setup lang="ts">
import { computed } from 'vue'

import { ItField, ItInput, ItRange } from '@components/theme'
import type { ErrorCorrectionLevel, FormatType, QrOptions } from '@/types/qr'

const LEVELS = [
  { value: 'L', label: 'Low (L)' },
  { value: 'M', label: 'Medium (M)' },
  { value: 'Q', label: 'Quartile (Q)' },
  { value: 'H', label: 'High (H)' },
] as const satisfies ReadonlyArray<{ value: ErrorCorrectionLevel; label: string }>

const FORMATS = [
  { value: 'svg', label: 'SVG' },
  { value: 'png', label: 'PNG' },
  { value: 'webp', label: 'WebP' },
  { value: 'jpeg', label: 'JPEG' },
] as const satisfies ReadonlyArray<{ value: FormatType; label: string }>

const model = defineModel<QrOptions>({ required: true })

function update(patch: Partial<QrOptions>) {
  model.value = { ...model.value, ...patch }
}

const level = computed<string>({
  get: () => model.value.level,
  set: (value) => update({ level: value as ErrorCorrectionLevel }),
})

const format = computed<string>({
  get: () => model.value.format,
  set: (value) => update({ format: value as FormatType }),
})

const moduleSize = computed<number>({
  get: () => model.value.moduleSize,
  set: (value) => update({ moduleSize: Math.min(24, Math.max(2, Number(value) || 2)) }),
})

const quietZone = computed<number>({
  get: () => model.value.quietZone,
  set: (value) => update({ quietZone: Math.min(12, Math.max(0, Number(value) || 0)) }),
})

const dark = computed<string>({
  get: () => model.value.dark,
  set: (value) => update({ dark: value }),
})

const light = computed<string>({
  get: () => model.value.light,
  set: (value) => update({ light: value }),
})
</script>

<template>
  <section aria-labelledby="options-heading" class="flex flex-col gap-5">
    <h2 id="options-heading" class="it-h5 text-lg font-semibold">Options</h2>

    <fieldset class="it-fieldset-plain">
      <legend class="mb-2 text-sm font-medium">Error correction</legend>
      <div class="it-choice-group it-choice-group-2">
        <label
          v-for="option in LEVELS"
          :key="option.value"
          :for="`level-${option.value}`"
          class="it-choice"
        >
          <input
            :id="`level-${option.value}`"
            v-model="level"
            type="radio"
            name="level"
            :value="option.value"
          />
          <span>{{ option.label }}</span>
        </label>
      </div>
    </fieldset>

    <fieldset class="it-fieldset-plain">
      <legend class="mb-2 text-sm font-medium">Format</legend>
      <div class="it-choice-group it-choice-group-4">
        <label
          v-for="option in FORMATS"
          :key="option.value"
          :for="`format-${option.value}`"
          class="it-choice"
        >
          <input
            :id="`format-${option.value}`"
            v-model="format"
            type="radio"
            name="format"
            :value="option.value"
          />
          <span>{{ option.label }}</span>
        </label>
      </div>
    </fieldset>

    <ItField
      label="Module size"
      html-for="module-size"
      hint="Export resolution, in pixels per module."
    >
      <div class="flex items-center gap-3">
        <ItRange
          id="module-size"
          v-model="moduleSize"
          aria-label="Module size"
          :min="2"
          :max="24"
          :step="1"
          class="flex-1"
        />
        <ItInput
          v-model="moduleSize"
          type="number"
          aria-label="Module size value"
          :min="2"
          :max="24"
          class="w-20"
        />
      </div>
    </ItField>

    <ItField label="Quiet zone" html-for="quiet-zone" hint="Modules of margin around the code.">
      <div class="flex items-center gap-3">
        <ItRange
          id="quiet-zone"
          v-model="quietZone"
          aria-label="Quiet zone"
          :min="0"
          :max="12"
          :step="1"
          class="flex-1"
        />
        <ItInput
          v-model="quietZone"
          type="number"
          aria-label="Quiet zone value"
          :min="0"
          :max="12"
          class="w-20"
        />
      </div>
    </ItField>

    <div class="grid grid-cols-2 gap-3">
      <ItField label="Dark colour" html-for="color-dark">
        <ItInput
          id="color-dark"
          v-model="dark"
          aria-label="Dark colour"
          type="color"
          class="h-10 p-1"
        />
      </ItField>
      <ItField label="Light colour" html-for="color-light">
        <ItInput
          id="color-light"
          v-model="light"
          aria-label="Light colour"
          type="color"
          class="h-10 p-1"
        />
      </ItField>
    </div>
  </section>
</template>
