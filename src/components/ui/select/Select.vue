<script setup lang="ts">
const model = defineModel<string>({ required: true })

interface Props {
  id?: string
  disabled?: boolean
}

withDefaults(defineProps<Props>(), { disabled: false })
</script>

<template>
  <select
    :id="id"
    v-model="model"
    :disabled="disabled"
    class="h-10 w-full cursor-pointer rounded-sm border border-secondary bg-background px-2 text-foreground outline-none focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
  >
    <slot />
  </select>
</template>
