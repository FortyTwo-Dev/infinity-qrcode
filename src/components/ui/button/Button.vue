<script setup lang="ts">
type Variant = 'primary' | 'secondary' | 'ghost'

interface Props {
  variant?: Variant
  type?: 'button' | 'submit'
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  type: 'button',
  disabled: false,
})

defineEmits<{ click: [event: MouseEvent] }>()

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-primary-foreground border-transparent hover:opacity-85',
  secondary: 'bg-secondary text-foreground border-secondary hover:opacity-85',
  ghost: 'bg-transparent text-foreground border-transparent hover:bg-secondary',
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'inline-flex cursor-pointer items-center justify-center rounded-sm border px-3 py-2 text-sm font-semibold transition-opacity',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
      'disabled:cursor-not-allowed disabled:opacity-50',
      variantClasses[variant],
    ]"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>
