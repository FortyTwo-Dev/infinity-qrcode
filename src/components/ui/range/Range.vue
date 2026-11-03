<script setup lang="ts">
const model = defineModel<number>({ required: true })

interface Props {
  id?: string
  min?: number
  max?: number
  step?: number
}

withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
})
</script>

<template>
  <input
    :id="id"
    v-model.number="model"
    type="range"
    :min="min"
    :max="max"
    :step="step"
    class="w-full cursor-pointer accent-primary"
  />
</template>
