<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { ItButton, ItOption, ItRange, ItSelect } from '@components/theme'
import { PHASE_INFO } from '@/lib/learn/phases'
import type { LearnPhase } from '@/types/learn'

const { t } = useI18n()

interface Props {
  frameCount: number
  frameIndex: number
  phases: LearnPhase[]
  playing: boolean
  speed: number
  reducedMotion?: boolean
  shareUrl: string
}

const props = withDefaults(defineProps<Props>(), { reducedMotion: false })

const copied = ref(false)
const copyError = ref(false)
let copyTimer: ReturnType<typeof setTimeout> | undefined

async function copyLink() {
  clearTimeout(copyTimer)
  copyError.value = false

  try {
    await navigator.clipboard.writeText(props.shareUrl)
    copied.value = true
    copyTimer = setTimeout(() => (copied.value = false), 2000)
  } catch {
    copyError.value = true
    copyTimer = setTimeout(() => (copyError.value = false), 3000)
  }
}

onBeforeUnmount(() => clearTimeout(copyTimer))

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
  /** Message catalog key of the family legend. */
  label: string
  phases: readonly LearnPhase[]
  swatch: string
}

const FAMILIES: readonly Family[] = [
  {
    id: 'structure',
    label: 'learn.timeline.families.structure',
    phases: ['empty', 'finders', 'timing', 'alignment', 'version_info', 'format_reserved'],
    swatch: 'bg-secondary-foreground/25',
  },
  {
    id: 'data',
    label: 'learn.timeline.families.data',
    phases: ['data_placement'],
    swatch: 'bg-primary',
  },
  {
    id: 'masks',
    label: 'learn.timeline.families.masks',
    phases: ['mask_candidate', 'mask_chosen'],
    swatch: 'bg-warning',
  },
  {
    id: 'format',
    label: 'learn.timeline.families.format',
    phases: ['format_info'],
    swatch: 'bg-info',
  },
  {
    id: 'final',
    label: 'learn.timeline.families.final',
    phases: ['final'],
    swatch: 'bg-success',
  },
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
  return t(PHASE_INFO[phase].title)
}
</script>

<template>
  <section aria-labelledby="timeline-heading" class="flex flex-col gap-3">
    <div class="flex items-center justify-between gap-2">
      <h2 id="timeline-heading" class="it-h5 m-0 text-lg font-semibold">
        {{ t('learn.timeline.title') }}
      </h2>
      <div class="flex items-center gap-2">
        <p class="m-0 text-xs it-muted" aria-live="polite">
          {{
            t('learn.timeline.frameCounter', {
              current: frameCount ? frameIndex + 1 : 0,
              total: frameCount,
            })
          }}
        </p>
        <button
          type="button"
          class="it-btn it-btn-secondary it-btn-sm it-btn-icon"
          :aria-label="copied ? t('learn.timeline.linkCopied') : t('learn.timeline.copyLink')"
          :title="copied ? t('learn.timeline.linkCopied') : t('learn.timeline.copyLink')"
          :disabled="frameCount === 0"
          @click="copyLink"
        >
          <svg
            v-if="!copied"
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
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path d="m8.59 13.51 6.83 3.98M15.41 6.51 8.59 10.49" />
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
            <path d="m5 12 5 5L20 7" />
          </svg>
        </button>
      </div>
    </div>

    <p v-if="copyError" class="text-xs text-destructive" role="alert">
      {{ t('learn.timeline.copyFailed') }}
    </p>

    <div>
      <fieldset class="it-fieldset-plain flex h-4 w-full bg-secondary">
        <legend class="sr-only">{{ t('learn.timeline.phasesLegend') }}</legend>
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
          :aria-label="t('learn.timeline.jumpTo', { phase: phaseTitle(run.phase) })"
          :aria-current="run.start === currentStart ? 'step' : undefined"
          :title="phaseTitle(run.phase)"
          @click="emit('update:frame-index', run.start)"
        />
      </fieldset>

      <ul class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
        <li v-for="family in FAMILIES" :key="family.id" class="flex items-center gap-1">
          <span class="inline-block h-2 w-2" :class="family.swatch" aria-hidden="true" />
          {{ t(family.label) }}
        </li>
      </ul>
    </div>

    <ItRange
      v-model="index"
      :min="0"
      :max="Math.max(0, frameCount - 1)"
      :step="1"
      :aria-label="t('learn.timeline.frame')"
      :disabled="frameCount <= 1"
    />

    <div class="flex flex-wrap items-center gap-2">
      <ItButton
        class="it-btn-icon"
        variant="secondary"
        size="sm"
        :aria-label="t('learn.timeline.firstFrame')"
        :title="t('learn.timeline.firstFrame')"
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
        :aria-label="t('learn.timeline.previousFrame')"
        :title="t('learn.timeline.previousFrame')"
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
        :aria-label="playing ? t('learn.timeline.pause') : t('learn.timeline.play')"
        :title="
          reducedMotion
            ? t('learn.timeline.reducedMotionTitle')
            : playing
              ? t('learn.timeline.pause')
              : t('learn.timeline.play')
        "
        :disabled="frameCount === 0 || reducedMotion"
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
        :aria-label="t('learn.timeline.nextFrame')"
        :title="t('learn.timeline.nextFrame')"
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
        :aria-label="t('learn.timeline.lastFrame')"
        :title="t('learn.timeline.lastFrame')"
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

      <div class="ml-auto flex items-center gap-2 it-small">
        <span>{{ t('learn.timeline.speed') }}</span>
        <ItSelect
          id="timeline-speed"
          v-model="speed"
          :aria-label="t('learn.timeline.speed')"
          class="w-24"
        >
          <ItOption value="0.5" text="0.5×" />
          <ItOption value="1" text="1×" />
          <ItOption value="2" text="2×" />
          <ItOption value="4" text="4×" />
        </ItSelect>
      </div>
    </div>

    <p v-if="reducedMotion" class="text-xs it-muted">
      {{ t('learn.timeline.reducedMotionNote') }}
    </p>
  </section>
</template>
