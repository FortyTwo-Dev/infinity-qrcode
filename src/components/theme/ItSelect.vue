<script setup lang="ts">
import { computed } from 'vue'

type Size = 'sm' | 'md' | 'lg'
type Variant = 'default' | 'primary'

interface Props {
  id?: string
  invalid?: boolean
  disabled?: boolean
  size?: Size
  variant?: Variant
  describedby?: string
}

const props = withDefaults(defineProps<Props>(), {
  invalid: false,
  disabled: false,
  size: 'md',
  variant: 'default',
})

const model = defineModel<string>()

const classes = computed(() => [
  'it-select',
  `it-select-${props.size}`,
  props.variant === 'primary' ? 'it-select-primary' : undefined,
  props.invalid ? 'it-select-invalid' : undefined,
])
</script>

<template>
  <select
    :id="id"
    v-model="model"
    :disabled="disabled"
    :aria-invalid="invalid || undefined"
    :aria-describedby="describedby"
    :class="classes"
  >
    <slot />
  </select>
</template>
