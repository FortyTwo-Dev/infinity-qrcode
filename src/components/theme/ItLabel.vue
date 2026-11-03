<script setup lang="ts">
interface Props {
  htmlFor?: string
}

defineProps<Props>()
</script>

<template>
  <label :for="htmlFor" class="it-label">
    <slot />
  </label>
</template>
