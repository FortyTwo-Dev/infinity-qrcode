<script setup lang="ts">
import { computed } from 'vue'

import { ItButton, ItOption, ItRange, ItSelect } from '@components/theme'
import { PHASE_INFO } from '@/lib/learn/phases'
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

interface Family {
  id: string
  label: string
  phases: readonly LearnPhase[]
  swatch: string
}

const FAMILIES: readonly Family[] = [
  {
    id: 'structure',
    label: 'Structure',
    phases: ['empty', 'finders', 'timing', 'alignment', 'version_info', 'format_reserved'],
    swatch: 'bg-secondary-foreground/25',
  },
  { id: 'data', label: 'Data', phases: ['data_placement'], swatch: 'bg-primary' },
  { id: 'masks', label: 'Masks', phases: ['mask_candidate', 'mask_chosen'], swatch: 'bg-warning' },
  { id: 'format', label: 'Format', phases: ['format_info'], swatch: 'bg-info' },
  { id: 'final', label: 'Final', phases: ['final'], swatch: 'bg-success' },
]

function familyOf(phase: LearnPhase): Family {
  return FAMILIES.find((family) => family.phases.includes(phase)) ?? FAMILIES[0]
}

interface PhaseRun {
  phase: LearnPhase
  start: number
  length: number
}

const runs = computed<PhaseRun[]>(() => {
  const result: PhaseRun[] = []

  props.phases.forEach((phase, frame) => {
    const last = result.at(-1)
    if (last && last.phase === phase) last.length += 1
    else result.push({ phase, start: frame, length: 1 })
  })

  return result
})

const currentStart = computed(() => {
  const run = runs.value.find(
    (item) => props.frameIndex >= item.start && props.frameIndex < item.start + item.length,
  )
  return run?.start ?? -1
})

function phaseTitle(phase: LearnPhase): string {
  return PHASE_INFO[phase].title
}
</script>

<template>
  <section aria-labelledby="timeline-heading" class="flex flex-col gap-3">
    <div class="flex items-center justify-between gap-2">
      <h2 id="timeline-heading" class="it-h5 text-lg font-semibold">Timeline</h2>
      <p class="text-xs opacity-70" aria-live="polite">
        Frame {{ frameCount ? frameIndex + 1 : 0 }} / {{ frameCount }}
      </p>
    </div>

    <div>
      <div role="group" aria-label="Construction phases" class="flex h-4 w-full bg-secondary">
        <button
          v-for="run in runs"
          :key="run.start"
          type="button"
          class="block h-full min-w-1 border-0 p-0"
          :class="[
            familyOf(run.phase).swatch,
            run.start === currentStart ? 'outline-2 outline-offset-1 outline-foreground' : '',
          ]"
          :style="{ flexGrow: run.length, flexBasis: 0 }"
          :aria-label="`Jump to ${phaseTitle(run.phase)}`"
          :aria-current="run.start === currentStart ? 'step' : undefined"
          :title="phaseTitle(run.phase)"
          @click="emit('update:frame-index', run.start)"
        />
      </div>

      <ul class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
        <li v-for="family in FAMILIES" :key="family.id" class="flex items-center gap-1">
          <span class="inline-block h-2 w-2" :class="family.swatch" aria-hidden="true" />
          {{ family.label }}
        </li>
      </ul>
    </div>

    <ItRange
      v-model="index"
      :min="0"
      :max="Math.max(0, frameCount - 1)"
      :step="1"
      aria-label="Frame"
      :disabled="frameCount <= 1"
    />

    <div class="flex flex-wrap items-center gap-2">
      <ItButton
        class="it-btn-icon"
        variant="secondary"
        size="sm"
        aria-label="First frame"
        title="First frame"
        :disabled="frameCount === 0 || frameIndex === 0"
        @click="emit('update:frame-index', 0)"
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
          <polygon points="19 20 9 12 19 4 19 20" />
          <line x1="5" x2="5" y1="19" y2="5" />
        </svg>
      </ItButton>

      <ItButton
        class="it-btn-icon"
        variant="secondary"
        size="sm"
        aria-label="Previous frame"
        title="Previous frame"
        :disabled="frameCount === 0 || frameIndex === 0"
        @click="emit('update:frame-index', frameIndex - 1)"
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
          <path d="m15 18-6-6 6-6" />
        </svg>
      </ItButton>

      <ItButton
        class="it-btn-icon"
        size="sm"
        :aria-label="playing ? 'Pause' : 'Play'"
        :title="playing ? 'Pause' : 'Play'"
        :disabled="frameCount === 0"
        @click="emit('toggle')"
      >
        <svg
          v-if="!playing"
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
          <polygon points="6 3 20 12 6 21 6 3" />
        </svg>
        <svg
          v-else
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
          <rect x="14" y="4" width="4" height="16" />
          <rect x="6" y="4" width="4" height="16" />
        </svg>
      </ItButton>

      <ItButton
        class="it-btn-icon"
        variant="secondary"
        size="sm"
        aria-label="Next frame"
        title="Next frame"
        :disabled="frameCount === 0 || frameIndex >= frameCount - 1"
        @click="emit('update:frame-index', frameIndex + 1)"
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
          <path d="m9 18 6-6-6-6" />
        </svg>
      </ItButton>

      <ItButton
        class="it-btn-icon"
        variant="secondary"
        size="sm"
        aria-label="Last frame"
        title="Last frame"
        :disabled="frameCount === 0 || frameIndex >= frameCount - 1"
        @click="emit('update:frame-index', frameCount - 1)"
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
          <polygon points="5 4 15 12 5 20 5 4" />
          <line x1="19" x2="19" y1="5" y2="19" />
        </svg>
      </ItButton>

      <div class="ml-auto flex items-center gap-2 text-sm">
        <span>Speed</span>
        <ItSelect id="timeline-speed" v-model="speed" aria-label="Speed" class="w-24">
          <ItOption value="0.5" text="0.5×" />
          <ItOption value="1" text="1×" />
          <ItOption value="2" text="2×" />
          <ItOption value="4" text="4×" />
        </ItSelect>
      </div>
    </div>
  </section>
</template>
