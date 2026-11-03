<script setup lang="ts">
const model = defineModel<string | number>()

interface Props {
  id?: string
  type?: 'text' | 'number' | 'email' | 'tel' | 'url' | 'color' | 'datetime-local'
  placeholder?: string
  min?: number | string
  max?: number | string
  step?: number | string
  disabled?: boolean
  invalid?: boolean
  describedby?: string
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  invalid: false,
})
</script>

<template>
  <input
    :id="id"
    v-model="model"
    :type="type"
    :placeholder="placeholder"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    :aria-invalid="invalid || undefined"
    :aria-describedby="describedby"
    class="h-10 w-full rounded-sm border border-secondary bg-background px-2 text-foreground outline-none focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
  />
</template>
