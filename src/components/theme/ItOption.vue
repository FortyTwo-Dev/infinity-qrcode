<script setup lang="ts">
interface Props {
  value: string
  text: string
}

defineProps<Props>()
</script>

<template>
  <option :value="value">{{ text }}</option>
</template>
