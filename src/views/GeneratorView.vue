<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { RouterLink } from 'vue-router'

import ContentPicker from '@components/generator/ContentPicker.vue'
import OptionsPanel from '@components/generator/OptionsPanel.vue'
import PayloadForm from '@components/generator/PayloadForm.vue'
import QrPreview from '@components/generator/QrPreview.vue'
import { generateQr, useQrWasm } from '@/composables/useQrWasm'
import { downloadQr } from '@/lib/qrcode/export'
import type { QrMatrixData, QrOptions, QrcodeType } from '@/types/qr'

const type = ref<QrcodeType>('text')
const payload = ref('')
const fieldErrors = ref<Record<string, string>>({})
const data = shallowRef<QrMatrixData | null>(null)
const generationError = ref<string | null>(null)

const options = ref<QrOptions>({
  level: 'H',
  format: 'svg',
  moduleSize: 8,
  quietZone: 4,
  dark: '#000000',
  light: '#ffffff',
})

const { ready, error: wasmError } = useQrWasm()

const valid = computed(
  () => payload.value.length > 0 && Object.keys(fieldErrors.value).length === 0,
)

let debounce: ReturnType<typeof setTimeout> | undefined

function regenerate() {
  if (!ready.value || !valid.value) {
    data.value = null
    generationError.value = null
    return
  }

  try {
    data.value = generateQr(payload.value, options.value.level)
    generationError.value = null
  } catch (cause) {
    data.value = null
    generationError.value = cause instanceof Error ? cause.message : String(cause)
  }
}

function schedule() {
  clearTimeout(debounce)
  debounce = setTimeout(regenerate, 180)
}

watch([payload, valid, () => options.value.level, ready], () => schedule(), { immediate: true })

onBeforeUnmount(() => clearTimeout(debounce))

function handlePayload(value: string) {
  payload.value = value
}

function handleErrors(errors: Record<string, string>) {
  fieldErrors.value = errors
}

function handleDownload() {
  if (!data.value) return
  const basename = `qrcode-${type.value.replace(/[^a-z0-9]+/g, '-')}`
  downloadQr(data.value, options.value, basename)
}

const displayError = computed(() => wasmError.value ?? generationError.value)

const learnLink = computed(() => ({
  name: 'learn',
  query: valid.value ? { data: payload.value, level: options.value.level } : {},
}))
</script>

<template>
  <div class="mx-auto w-full max-w-7xl px-4 py-8">
    <header class="mb-8 flex flex-col items-center gap-2 text-center">
      <h1 class="text-4xl font-semibold">Infinity QRCode</h1>
      <p class="max-w-2xl opacity-80">
        Generate a QR code for text, links, Wi-Fi, contacts and more, or
        <RouterLink :to="learnLink" class="text-primary hover:underline">
          see how it is built
        </RouterLink>
        step by step.
      </p>
    </header>

    <div class="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)_18rem]">
      <section class="flex flex-col gap-6 rounded-sm border border-border p-4" aria-label="Content">
        <ContentPicker v-model="type" />
        <PayloadForm :type="type" @update:payload="handlePayload" @update:errors="handleErrors" />
      </section>

      <QrPreview
        :data="data"
        :options="options"
        :loading="!ready && !wasmError"
        :error="displayError"
        @download="handleDownload"
      >
        <template #actions>
          <RouterLink :to="learnLink" class="text-sm text-primary hover:underline">
            Learn how it is built
          </RouterLink>
        </template>
      </QrPreview>

      <section class="rounded-sm border border-border p-4">
        <OptionsPanel v-model="options" />
      </section>
    </div>
  </div>
</template>
