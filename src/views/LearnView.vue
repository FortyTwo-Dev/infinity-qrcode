<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import type { LearnTrace } from 'iqrcode-learn-wasm'

import PayloadForm from '@components/generator/PayloadForm.vue'
import LearnControls from '@components/learn/LearnControls.vue'
import LearnStage from '@components/learn/LearnStage.vue'
import LearnTimeline from '@components/learn/LearnTimeline.vue'
import PhasePanel from '@components/learn/PhasePanel.vue'
import TraceStats from '@components/learn/TraceStats.vue'
import {
  createLearnTrace,
  readLearnFrame,
  readTraceMetadata,
  useLearnWasm,
} from '@/composables/useLearnWasm'
import { useReducedMotion } from '@/composables/useReducedMotion'
import type { LearnFrameData, LearnPhase, TraceMetadata } from '@/types/learn'
import type { ErrorCorrectionLevel, QrOptions } from '@/types/qr'

const { t } = useI18n()

const route = useRoute()
const router = useRouter()
const reducedMotion = useReducedMotion()

function queryString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function queryLevel(value: unknown): ErrorCorrectionLevel | null {
  return value === 'L' || value === 'M' || value === 'Q' || value === 'H' ? value : null
}

const initialText = queryString(route.query.data)
const initialFrame = (() => {
  const value = Number(route.query.frame)
  return Number.isFinite(value) && value >= 1 ? Math.floor(value) - 1 : null
})()
let pendingFrame = initialFrame
const payload = ref('')
const fieldErrors = ref<Record<string, string>>({})
const level = ref<ErrorCorrectionLevel>(queryLevel(route.query.level) ?? 'H')
const version = ref<number | null>(null)
const stride = ref(10)
const maskCandidates = ref(true)
const frameIndex = ref(0)
const frameCount = ref(0)
const phases = ref<LearnPhase[]>([])
const frame = shallowRef<LearnFrameData | null>(null)
const metadata = ref<TraceMetadata | null>(null)
const traceError = ref<string | null>(null)
const playing = ref(false)
const speed = ref(1)
const zoom = ref(1)
const trace = shallowRef<LearnTrace | null>(null)

const { ready, error: wasmError } = useLearnWasm()

const stageOptions: QrOptions = {
  level: 'H',
  format: 'svg',
  moduleSize: 4,
  quietZone: 4,
  dark: '#000000',
  light: '#ffffff',
}

const valid = computed(
  () => payload.value.length > 0 && Object.keys(fieldErrors.value).length === 0,
)

const displayError = computed(() => wasmError.value ?? traceError.value)

function disposeTrace() {
  trace.value?.free()
  trace.value = null
}

function readPhases(next: LearnTrace, count: number): LearnPhase[] {
  const list = new Array<LearnPhase>(count).fill('empty')
  const step = Math.max(1, Math.ceil(count / 240))

  for (let index = 0; index < count; index += step) {
    const current = next.frame(index)
    const phase = current.phase() as LearnPhase
    current.free()
    for (let fill = index; fill < Math.min(index + step, count); fill += 1) {
      list[fill] = phase
    }
  }

  return list
}

function rebuildTrace() {
  disposeTrace()
  frame.value = null
  metadata.value = null
  phases.value = []
  frameCount.value = 0
  frameIndex.value = 0
  traceError.value = null

  if (!ready.value || !valid.value) return

  try {
    const next = createLearnTrace(
      payload.value,
      level.value,
      version.value,
      stride.value,
      maskCandidates.value,
    )
    trace.value = next
    metadata.value = readTraceMetadata(next)
    frameCount.value = next.frame_count()
    phases.value = readPhases(next, frameCount.value)
    frameIndex.value = 0
    if (pendingFrame !== null) {
      frameIndex.value = Math.min(pendingFrame, frameCount.value - 1)
      pendingFrame = null
    }
  } catch (cause) {
    disposeTrace()
    frameCount.value = 0
    traceError.value = cause instanceof Error ? cause.message : String(cause)
  }
}

let debounce: ReturnType<typeof setTimeout> | undefined

function schedule() {
  clearTimeout(debounce)
  debounce = setTimeout(rebuildTrace, 220)
}

watch([payload, valid, level, version, stride, maskCandidates, ready], () => schedule(), {
  immediate: true,
})

watch(
  [trace, frameIndex],
  () => {
    const current = trace.value
    if (!current) {
      frame.value = null
      return
    }
    frame.value = readLearnFrame(current, frameIndex.value)
  },
  { immediate: true },
)

let timer: ReturnType<typeof setInterval> | undefined

function stopPlayback() {
  clearInterval(timer)
  timer = undefined
}

function tick() {
  if (!trace.value) {
    playing.value = false
    return
  }
  if (frameIndex.value >= frameCount.value - 1) {
    playing.value = false
    return
  }
  frameIndex.value += 1
}

watch([playing, speed], () => {
  stopPlayback()
  if (playing.value && frameCount.value > 0) {
    timer = setInterval(tick, Math.max(80, 600 / speed.value))
  }
})

function setFrame(index: number) {
  frameIndex.value = Math.min(frameCount.value - 1, Math.max(0, index))
}

function togglePlayback() {
  if (reducedMotion.value) return
  playing.value = !playing.value
}

watch(reducedMotion, (value) => {
  if (value) playing.value = false
})

function onKeyDown(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  if (
    target &&
    (target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable)
  ) {
    return
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    playing.value = false
    setFrame(frameIndex.value - 1)
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    playing.value = false
    setFrame(frameIndex.value + 1)
  } else if (event.key === ' ') {
    event.preventDefault()
    togglePlayback()
  }
}

onMounted(() => window.addEventListener('keydown', onKeyDown))

let urlTimer: ReturnType<typeof setTimeout> | undefined

const shareUrl = computed(() => {
  const url = new URL(window.location.href)
  url.search = ''
  if (payload.value) url.searchParams.set('data', payload.value)
  url.searchParams.set('level', level.value)
  if (frameIndex.value > 0) url.searchParams.set('frame', String(frameIndex.value + 1))
  return url.toString()
})

function syncQuery() {
  const query: Record<string, string> = { level: level.value }
  if (payload.value) query.data = payload.value
  if (frameIndex.value > 0) query.frame = String(frameIndex.value + 1)
  void router.replace({ query })
}

watch([payload, level, frameIndex], () => {
  clearTimeout(urlTimer)
  urlTimer = setTimeout(syncQuery, 300)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
  clearTimeout(urlTimer)
  stopPlayback()
  disposeTrace()
})

function handlePayload(value: string) {
  payload.value = value
}

function handleErrors(errors: Record<string, string>) {
  fieldErrors.value = errors
}
</script>

<template>
  <div class="app-container page-body">
    <header class="page-hero">
      <h1 class="learn-title">{{ t('learn.title') }}</h1>
      <p class="page-tagline it-muted">
        {{ t('learn.tagline') }}
      </p>
    </header>

    <div class="learn-columns">
      <section
        class="generator-panel section-stack learn-content-slot"
        :class="valid ? 'stack-second' : 'stack-first'"
        :aria-label="t('learn.sections.content')"
      >
        <PayloadForm
          type="text"
          :initial-text="initialText"
          @update:payload="handlePayload"
          @update:errors="handleErrors"
        />
        <LearnControls
          :level="level"
          :version="version"
          :stride="stride"
          :mask-candidates="maskCandidates"
          @update:level="level = $event"
          @update:version="version = $event"
          @update:stride="stride = $event"
          @update:mask-candidates="maskCandidates = $event"
        />
      </section>

      <section
        class="section-stack learn-stage-slot"
        :class="valid ? 'stack-first' : 'stack-second'"
        :aria-label="t('learn.sections.stage')"
      >
        <LearnStage
          :frame="frame"
          :options="stageOptions"
          :frame-index="frameIndex"
          :frame-count="frameCount"
          :zoom="zoom"
          @update:zoom="zoom = $event"
        />
        <LearnTimeline
          :frame-count="frameCount"
          :frame-index="frameIndex"
          :phases="phases"
          :playing="playing"
          :speed="speed"
          :reduced-motion="reducedMotion"
          :share-url="shareUrl"
          @update:frame-index="setFrame"
          @update:speed="speed = $event"
          @toggle="togglePlayback"
        />
        <p
          v-if="displayError"
          class="error-box it-small text-danger"
          role="alert"
        >
          {{ displayError }}
        </p>
      </section>

      <section
        class="generator-panel section-stack learn-details-slot"
        :aria-label="t('learn.sections.details')"
      >
        <PhasePanel
          :phase="frame?.phase ?? null"
          :bit-index="frame?.bitIndex"
          :mask="frame?.mask"
          :penalty="frame?.penalty"
        />
        <TraceStats :metadata="metadata" :phase="frame?.phase ?? null" />
      </section>
    </div>
  </div>
</template>
