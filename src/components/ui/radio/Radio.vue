<script setup lang="ts">
const model = defineModel<string>({ required: true })

interface Props {
  value: string
  name: string
  label: string
  id?: string
}

defineProps<Props>()
</script>

<template>
  <label
    :for="id"
    class="inline-flex cursor-pointer items-center gap-2 rounded-sm bg-secondary px-2 py-1.5 text-sm hover:opacity-85"
  >
    <input
      :id="id"
      v-model="model"
      type="radio"
      :name="name"
      :value="value"
      class="h-4 w-4 cursor-pointer accent-primary"
    />
    <span>{{ label }}</span>
  </label>
</template>
