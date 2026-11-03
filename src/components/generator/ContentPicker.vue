<script setup lang="ts">
import { ItButton } from '@components/theme'
import { CONTENT_TYPES, type QrcodeType } from '@/types/qr'

defineProps<{ modelValue: QrcodeType }>()

defineEmits<{ 'update:modelValue': [value: QrcodeType] }>()
</script>

<template>
  <section aria-labelledby="content-heading">
    <h2 id="content-heading" class="it-h5 mb-3 text-lg font-semibold">Content</h2>
    <div class="grid grid-cols-2 gap-2">
      <ItButton
        v-for="item in CONTENT_TYPES"
        :key="item.value"
        :variant="modelValue === item.value ? 'primary' : 'secondary'"
        :aria-pressed="modelValue === item.value"
        class="justify-start"
        @click="$emit('update:modelValue', item.value)"
      >
        {{ item.label }}
      </ItButton>
    </div>
  </section>
</template>
