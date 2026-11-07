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
  <div class="it-field">
    <div class="row">
      <label v-if="htmlFor" :for="htmlFor" class="it-field-label">{{ label }}</label>
      <span v-else class="it-field-label">{{ label }}</span>
      <slot name="help" />
    </div>
    <slot />
    <p v-if="error" :id="errorId" class="it-field-error" role="alert">{{ error }}</p>
    <p v-else-if="hint" class="it-field-hint">{{ hint }}</p>
  </div>
</template>
