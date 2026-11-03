<script setup lang="ts">
import { computed } from 'vue'

type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'search'
  | 'tel'
  | 'url'
  | 'number'
  | 'date'
  | 'time'
  | 'datetime-local'
  | 'color'

type Size = 'sm' | 'md' | 'lg'
type Variant = 'default' | 'primary'

interface Props {
  id?: string
  name?: string
  type?: InputType
  placeholder?: string
  autocomplete?: string
  invalid?: boolean
  disabled?: boolean
  size?: Size
  variant?: Variant
  describedby?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  invalid: false,
  disabled: false,
  size: 'md',
  variant: 'default',
})

const model = defineModel<string | number>()

const classes = computed(() => [
  'it-input',
  `it-input-${props.size}`,
  props.variant === 'primary' ? 'it-input-primary' : undefined,
  props.invalid ? 'it-input-invalid' : undefined,
])
</script>

<template>
  <input
    :id="id"
    v-model="model"
    :name="name"
    :type="type"
    :placeholder="placeholder"
    :autocomplete="autocomplete"
    :disabled="disabled"
    :aria-invalid="invalid || undefined"
    :aria-describedby="describedby"
    :class="classes"
  />
</template>
