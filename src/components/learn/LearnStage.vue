<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'

import { ItButton } from '@components/theme'
import QrCanvas from '@components/qr/QrCanvas.vue'
import type { LearnFrameData } from '@/types/learn'
import type { QrOptions } from '@/types/qr'

interface Props {
  frame: LearnFrameData | null
  options: QrOptions
  frameIndex: number
  frameCount: number
  zoom: number
}

const props = defineProps<Props>()

const emit = defineEmits<{ 'update:zoom': [zoom: number] }>()

const stage = useTemplateRef<HTMLDivElement>('stage')
const available = ref(0)
let observer: ResizeObserver | undefined

onMounted(() => {
  const element = stage.value
  if (!element) return

  observer = new ResizeObserver(() => {
    const style = getComputedStyle(element)
    const width =
      element.clientWidth -
      Number.parseFloat(style.paddingLeft) -
      Number.parseFloat(style.paddingRight)
    const height =
      element.clientHeight -
      Number.parseFloat(style.paddingTop) -
      Number.parseFloat(style.paddingBottom)
    available.value = Math.max(0, Math.min(width, height))
  })
  observer.observe(element)
})

onBeforeUnmount(() => observer?.disconnect())

const modules = computed(() => (props.frame ? props.frame.size + props.options.quietZone * 2 : 0))

/** Module size that makes the code fill the stage; zoom is a multiplier of it. */
const fitModuleSize = computed(() => {
  if (!modules.value || !available.value) return 1
  return Math.max(1, Math.floor(available.value / modules.value))
})

const moduleSize = computed(() => Math.max(1, Math.round(fitModuleSize.value * props.zoom)))
</script>

<template>
  <section aria-labelledby="stage-heading" class="flex flex-col gap-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 id="stage-heading" class="it-h5 text-lg font-semibold">Construction</h2>
      <div class="flex items-center gap-2">
        <ItButton
          variant="secondary"
          :disabled="zoom <= 0.5"
          aria-label="Zoom out"
          @click="emit('update:zoom', Math.max(0.5, zoom - 0.25))"
        >
          −
        </ItButton>
        <span class="text-xs opacity-70">{{ Math.round(zoom * 100) }}%</span>
        <ItButton
          variant="secondary"
          :disabled="zoom >= 4"
          aria-label="Zoom in"
          @click="emit('update:zoom', Math.min(4, zoom + 0.25))"
        >
          +
        </ItButton>
      </div>
    </div>

    <div
      ref="stage"
      class="flex h-96 items-center justify-center overflow-auto rounded-sm border border-border p-4"
    >
      <QrCanvas
        v-if="frame"
        :matrix="frame.matrix"
        :size="frame.size"
        :module-size="moduleSize"
        :quiet-zone="options.quietZone"
        :dark="options.dark"
        :light="options.light"
        :highlight="frame.highlight"
        :label="`QR construction frame ${frameIndex + 1} of ${frameCount}, phase ${frame.phase}`"
      />
      <p v-else class="text-sm opacity-70">Enter valid content to start the construction.</p>
    </div>
  </section>
</template>
