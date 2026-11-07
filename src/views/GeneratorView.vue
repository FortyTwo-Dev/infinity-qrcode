<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import ContentPicker from '@components/generator/ContentPicker.vue'
import OptionsPanel from '@components/generator/OptionsPanel.vue'
import PayloadForm from '@components/generator/PayloadForm.vue'
import QrPreview from '@components/generator/QrPreview.vue'
import { generateQr, useQrWasm } from '@/composables/useQrWasm'
import { downloadQr } from '@/lib/qrcode/export'
import type { QrMatrixData, QrOptions, QrcodeType } from '@/types/qr'

const { t } = useI18n()

const type = ref<QrcodeType>('text')
const payload = ref('')
const fieldErrors = ref<Record<string, string>>({})
const data = shallowRef<QrMatrixData | null>(null)
const generationError = ref<string | null>(null)

const options = ref<QrOptions>({
  level: 'H',
  format: 'svg',
  moduleSize: 8,
  quietZone: 2,
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
</script>

<template>
  <div class="app-container page-body">
    <header class="page-hero">
      <h1 class="page-title">{{ t('generator.title') }}</h1>
      <p class="page-tagline it-muted">{{ t('generator.tagline') }}</p>
    </header>

    <div class="generator-columns">
      <section class="generator-panel">
        <ContentPicker v-model="type" />
      </section>

      <div class="section-stack">
        <QrPreview
          class="generator-preview-order"
          :data="data"
          :options="options"
          :loading="!ready && !wasmError"
          :error="displayError"
          @download="handleDownload"
        />

        <section
          class="generator-content-order generator-panel"
          aria-labelledby="details-heading"
        >
          <h2 id="details-heading" class="it-h5 panel-title panel-title-gap">
            {{ t('generator.sections.content') }}
          </h2>
          <PayloadForm :type="type" @update:payload="handlePayload" @update:errors="handleErrors" />
        </section>
      </div>

      <section class="generator-panel">
        <OptionsPanel v-model="options" :module-count="data?.size ?? null" />
      </section>
    </div>
  </div>
</template>
