<script setup lang="ts">
import { computed } from 'vue'

import { ItField, ItInput, ItRange } from '@components/theme'
import {
  ERROR_CORRECTION_LEVELS,
  type ErrorCorrectionLevel,
  type FormatType,
  type QrOptions,
} from '@/types/qr'

const FORMATS = [
  { value: 'svg', label: 'SVG' },
  { value: 'png', label: 'PNG' },
  { value: 'webp', label: 'WebP' },
  { value: 'jpeg', label: 'JPEG' },
] as const satisfies ReadonlyArray<{ value: FormatType; label: string }>

const props = withDefaults(defineProps<{ moduleCount?: number | null }>(), { moduleCount: null })

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

function relativeLuminance(hex: string): number {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!match) return 0

  const value = match[1]
  const channels = [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16) / 255)
  const linear = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  )
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
}

const darkLuminance = computed(() => relativeLuminance(model.value.dark))
const lightLuminance = computed(() => relativeLuminance(model.value.light))
const inverted = computed(() => darkLuminance.value > lightLuminance.value)
const contrastRatio = computed(() => {
  const lighter = Math.max(darkLuminance.value, lightLuminance.value)
  const darker = Math.min(darkLuminance.value, lightLuminance.value)
  return (lighter + 0.05) / (darker + 0.05)
})
const lowContrast = computed(() => contrastRatio.value < 4.5)

const exportSize = computed(() => {
  if (props.moduleCount === null) return null
  return (props.moduleCount + model.value.quietZone * 2) * model.value.moduleSize
})

const moduleHint = computed(() =>
  exportSize.value === null
    ? 'Export resolution, in pixels per module.'
    : `Export resolution. Current file: ${exportSize.value} × ${exportSize.value} px.`,
)
</script>

<template>
  <section aria-labelledby="options-heading" class="flex flex-col gap-5">
    <h2 id="options-heading" class="it-h5 text-lg font-semibold">Options</h2>

    <fieldset class="it-fieldset-plain">
      <legend class="mb-2 text-sm font-medium">Error correction</legend>
      <div class="it-choice-group it-choice-group-2">
        <label
          v-for="option in ERROR_CORRECTION_LEVELS"
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

    <ItField label="Module size" html-for="module-size" :hint="moduleHint">
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

    <div class="flex flex-col gap-1">
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
      <p v-if="quietZone < 1" class="border-l-2 border-warning bg-secondary p-2 text-xs">
        No quiet zone. Many scanners need some margin: add at least 1 module or leave room in the
        layout.
      </p>
    </div>

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

    <p v-if="inverted" class="border-l-2 border-destructive bg-secondary p-2 text-xs">
      The dark colour is lighter than the light one. Most scanners expect a dark code on a light
      background.
    </p>
    <p v-else-if="lowContrast" class="border-l-2 border-warning bg-secondary p-2 text-xs">
      Low contrast ({{ contrastRatio.toFixed(1) }}:1). Some scanners may fail to read this code.
    </p>
  </section>
</template>
