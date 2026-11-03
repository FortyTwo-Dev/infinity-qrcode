<script setup lang="ts">
interface Props {
  id?: string
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  describedby?: string
}

withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
})

const model = defineModel<number>({ required: true })
</script>

<template>
  <input
    :id="id"
    v-model.number="model"
    type="range"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    :aria-describedby="describedby"
    class="it-range"
  />
</template>
