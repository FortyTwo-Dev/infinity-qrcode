<script setup lang="ts">
import { computed, useId } from 'vue'

interface Props {
  id?: string
  label?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const model = defineModel<boolean>({ default: false })
const fallbackId = useId()
const inputId = computed(() => props.id ?? fallbackId)
</script>

<template>
  <label class="it-check" :for="inputId">
    <input :id="inputId" v-model="model" type="checkbox" class="it-checkbox" :disabled="disabled" />
    <span v-if="label">{{ label }}</span>
  </label>
</template>
