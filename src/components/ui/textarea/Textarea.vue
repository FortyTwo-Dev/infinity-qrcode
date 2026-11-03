<script setup lang="ts">
const model = defineModel<string>()

interface Props {
  id?: string
  placeholder?: string
  rows?: number
  disabled?: boolean
  invalid?: boolean
  describedby?: string
}

withDefaults(defineProps<Props>(), {
  rows: 3,
  disabled: false,
  invalid: false,
})
</script>

<template>
  <textarea
    :id="id"
    v-model="model"
    :placeholder="placeholder"
    :rows="rows"
    :disabled="disabled"
    :aria-invalid="invalid || undefined"
    :aria-describedby="describedby"
    class="w-full resize-y rounded-sm border border-secondary bg-background px-2 py-2 text-foreground outline-none focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
  />
</template>
