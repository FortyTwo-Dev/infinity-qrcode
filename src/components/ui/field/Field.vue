<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  htmlFor?: string
  error?: string
  hint?: string
}

const props = defineProps<Props>()

const errorId = computed(() => (props.htmlFor ? `${props.htmlFor}-error` : undefined))
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <span class="text-sm font-medium">{{ label }}</span>
    <slot />
    <p v-if="error" :id="errorId" class="text-xs text-destructive" role="alert">
      {{ error }}
    </p>
    <p v-else-if="hint" class="text-xs opacity-70">{{ hint }}</p>
  </div>
</template>
