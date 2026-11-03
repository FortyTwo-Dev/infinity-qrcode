<script setup lang="ts">
interface Props {
  htmlFor?: string
}

defineProps<Props>()
</script>

<template>
  <label :for="htmlFor" class="text-sm font-medium">
    <slot />
  </label>
</template>
