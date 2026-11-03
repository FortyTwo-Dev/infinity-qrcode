<script setup lang="ts">
import { computed } from 'vue'

type Size = 'sm' | 'md' | 'lg'
type Variant = 'default' | 'primary'

interface Props {
  id?: string
  placeholder?: string
  rows?: number
  invalid?: boolean
  disabled?: boolean
  size?: Size
  variant?: Variant
  describedby?: string
}

const props = withDefaults(defineProps<Props>(), {
  rows: 4,
  invalid: false,
  disabled: false,
  size: 'md',
  variant: 'default',
})

const model = defineModel<string>()

const classes = computed(() => [
  'it-textarea',
  `it-textarea-${props.size}`,
  props.variant === 'primary' ? 'it-textarea-primary' : undefined,
  props.invalid ? 'it-textarea-invalid' : undefined,
])
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
    :class="classes"
  />
</template>
