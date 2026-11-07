<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useId, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  label: string
  title: string
}

defineProps<Props>()

const emit = defineEmits<{ open: [] }>()

const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const open = ref(false)
const titleId = useId()

function show() {
  open.value = true
  emit('open')
  if (!dialog.value?.open) dialog.value?.showModal()
}

function hide() {
  dialog.value?.close()
}

function onClose() {
  open.value = false
}

let dialogElement: HTMLDialogElement | null = null

function onDialogClick(event: MouseEvent) {
  if (event.target === dialogElement) hide()
}

onMounted(() => {
  dialogElement = dialog.value
  dialogElement?.addEventListener('click', onDialogClick)
})

onBeforeUnmount(() => {
  dialogElement?.removeEventListener('click', onDialogClick)
  dialogElement = null
})
</script>

<template>
  <button
    type="button"
    class="it-btn it-btn-secondary it-btn-sm it-btn-icon"
    :aria-label="label"
    :title="label"
    aria-haspopup="dialog"
    :aria-expanded="open"
    @click="show"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  </button>

  <dialog
    ref="dialog"
    class="help-dialog"
    :aria-labelledby="titleId"
    @close="onClose"
  >
    <div class="help-body">
      <div class="help-header">
        <h2 :id="titleId" class="it-h4 flush">{{ title }}</h2>
        <button
          type="button"
          class="it-btn it-btn-secondary it-btn-sm it-btn-icon"
          :aria-label="t('learn.help.close')"
          @click="hide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <slot />
    </div>
  </dialog>
</template>
