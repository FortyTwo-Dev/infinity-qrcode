<script setup lang="ts">
import { computed } from 'vue'

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

const moduleSize = computed(() => Math.max(2, Math.round(4 * props.zoom)))
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
      class="flex min-h-80 items-center justify-center overflow-auto rounded-sm border border-border p-4"
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
