<script setup lang="ts">
import { computed } from 'vue'

import { Button, Option, Range, Select } from '@ui/index'
import type { LearnPhase } from '@/types/learn'

interface Props {
  frameCount: number
  frameIndex: number
  phases: LearnPhase[]
  playing: boolean
  speed: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:frame-index': [index: number]
  'update:speed': [speed: number]
  toggle: []
}>()

const index = computed<number>({
  get: () => props.frameIndex,
  set: (value) =>
    emit('update:frame-index', Math.min(props.frameCount - 1, Math.max(0, Number(value)))),
})

const speed = computed<string>({
  get: () => String(props.speed),
  set: (value) => emit('update:speed', Number(value)),
})

const markers = computed(() => {
  if (props.frameCount === 0) return []
  const maxMarkers = 120
  const step = Math.max(1, Math.ceil(props.frameCount / maxMarkers))
  const result: Array<{ index: number; phase: LearnPhase }> = []
  for (let i = 0; i < props.frameCount; i += step) {
    result.push({ index: i, phase: props.phases[i] ?? 'empty' })
  }
  return result
})

function markerClass(phase: LearnPhase): string {
  if (phase === 'data_placement') return 'bg-primary'
  if (phase === 'mask_candidate') return 'bg-accent-foreground/40'
  if (phase === 'final') return 'bg-destructive'
  return 'bg-secondary-foreground/30'
}
</script>

<template>
  <section aria-labelledby="timeline-heading" class="flex flex-col gap-3">
    <div class="flex items-center justify-between gap-2">
      <h2 id="timeline-heading" class="text-lg font-semibold">Timeline</h2>
      <p class="text-xs opacity-70" aria-live="polite">
        {{ frameCount ? frameIndex + 1 : 0 }} / {{ frameCount }}
      </p>
    </div>

    <div class="flex h-2 overflow-hidden rounded-sm bg-secondary" aria-hidden="true">
      <div
        v-for="marker in markers"
        :key="marker.index"
        class="h-full flex-1"
        :class="markerClass(marker.phase)"
        :title="marker.phase"
      />
    </div>

    <Range
      v-model="index"
      :min="0"
      :max="Math.max(0, frameCount - 1)"
      :step="1"
      :aria-label="'Frame'"
      :disabled="frameCount <= 1"
    />

    <div class="flex flex-wrap items-center gap-2">
      <Button
        variant="secondary"
        :disabled="frameCount === 0 || frameIndex === 0"
        @click="emit('update:frame-index', 0)"
      >
        First
      </Button>
      <Button
        variant="secondary"
        :disabled="frameCount === 0 || frameIndex === 0"
        @click="emit('update:frame-index', frameIndex - 1)"
      >
        Previous
      </Button>
      <Button :disabled="frameCount === 0" @click="emit('toggle')">
        {{ playing ? 'Pause' : 'Play' }}
      </Button>
      <Button
        variant="secondary"
        :disabled="frameCount === 0 || frameIndex >= frameCount - 1"
        @click="emit('update:frame-index', frameIndex + 1)"
      >
        Next
      </Button>
      <Button
        variant="secondary"
        :disabled="frameCount === 0 || frameIndex >= frameCount - 1"
        @click="emit('update:frame-index', frameCount - 1)"
      >
        Last
      </Button>

      <label for="timeline-speed" class="ml-auto flex items-center gap-2 text-sm">
        Speed
        <Select id="timeline-speed" v-model="speed" aria-label="Speed" class="w-24">
          <Option value="0.5" text="0.5×" />
          <Option value="1" text="1×" />
          <Option value="2" text="2×" />
          <Option value="4" text="4×" />
        </Select>
      </label>
    </div>
  </section>
</template>
