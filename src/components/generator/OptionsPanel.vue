<script setup lang="ts">
import { computed } from 'vue'

import { Field, Input, Radio, Range } from '@ui/index'
import type { ErrorCorrectionLevel, FormatType, QrOptions } from '@/types/qr'

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
    <h2 id="options-heading" class="text-lg font-semibold">Options</h2>

    <fieldset>
      <legend class="mb-2 text-sm font-medium">Error correction</legend>
      <div class="flex flex-wrap gap-2">
        <Radio id="level-l" v-model="level" name="level" value="L" label="Low" />
        <Radio id="level-m" v-model="level" name="level" value="M" label="Medium" />
        <Radio id="level-q" v-model="level" name="level" value="Q" label="Quartile" />
        <Radio id="level-h" v-model="level" name="level" value="H" label="High" />
      </div>
    </fieldset>

    <fieldset>
      <legend class="mb-2 text-sm font-medium">Format</legend>
      <div class="flex flex-wrap gap-2">
        <Radio id="format-svg" v-model="format" name="format" value="svg" label="SVG" />
        <Radio id="format-png" v-model="format" name="format" value="png" label="PNG" />
        <Radio id="format-webp" v-model="format" name="format" value="webp" label="WebP" />
        <Radio id="format-jpeg" v-model="format" name="format" value="jpeg" label="JPEG" />
      </div>
    </fieldset>

    <Field label="Module size" html-for="module-size" hint="Pixels per QR module.">
      <div class="flex items-center gap-3">
        <Range
          id="module-size"
          v-model="moduleSize"
          aria-label="Module size"
          :min="2"
          :max="24"
          :step="1"
          class="flex-1"
        />
        <Input
          v-model="moduleSize"
          type="number"
          aria-label="Module size value"
          :min="2"
          :max="24"
          class="w-20"
        />
      </div>
    </Field>

    <Field label="Quiet zone" html-for="quiet-zone" hint="Modules of margin around the code.">
      <div class="flex items-center gap-3">
        <Range
          id="quiet-zone"
          v-model="quietZone"
          aria-label="Quiet zone"
          :min="0"
          :max="12"
          :step="1"
          class="flex-1"
        />
        <Input
          v-model="quietZone"
          type="number"
          aria-label="Quiet zone value"
          :min="0"
          :max="12"
          class="w-20"
        />
      </div>
    </Field>

    <div class="grid grid-cols-2 gap-3">
      <Field label="Dark colour" html-for="color-dark">
        <Input
          id="color-dark"
          v-model="dark"
          aria-label="Dark colour"
          type="color"
          class="h-10 p-1"
        />
      </Field>
      <Field label="Light colour" html-for="color-light">
        <Input
          id="color-light"
          v-model="light"
          aria-label="Light colour"
          type="color"
          class="h-10 p-1"
        />
      </Field>
    </div>
  </section>
</template>
