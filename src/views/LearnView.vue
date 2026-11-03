<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'

import type { LearnTrace } from 'iqrcode-learn-wasm'

import ContentPicker from '@components/generator/ContentPicker.vue'
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
import type { LearnFrameData, LearnPhase, TraceMetadata } from '@/types/learn'
import type { ErrorCorrectionLevel, QrOptions, QrcodeType } from '@/types/qr'

const route = useRoute()

function queryString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function queryLevel(value: unknown): ErrorCorrectionLevel | null {
  return value === 'L' || value === 'M' || value === 'Q' || value === 'H' ? value : null
}

const initialText = queryString(route.query.data)
const type = ref<QrcodeType>('text')
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
  playing.value = !playing.value
}

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

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
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
  <div class="mx-auto w-full max-w-7xl px-4 py-8">
    <header class="mb-8 flex flex-col items-center gap-2 text-center">
      <h1 class="text-4xl font-semibold">Learn QR codes</h1>
      <p class="max-w-2xl opacity-80">
        Replay every step of a QR code construction: finder patterns, data placement, mask selection
        and format information.
      </p>
    </header>

    <div class="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)_20rem]">
      <section
        class="flex flex-col gap-6 rounded-sm border border-secondary p-4"
        aria-label="Trace content and options"
      >
        <ContentPicker v-model="type" />
        <PayloadForm
          :type="type"
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

      <section class="flex flex-col gap-6" aria-label="Construction stage">
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
          @update:frame-index="setFrame"
          @update:speed="speed = $event"
          @toggle="togglePlayback"
        />
        <p
          v-if="displayError"
          class="rounded-sm border border-destructive p-3 text-sm text-destructive"
          role="alert"
        >
          {{ displayError }}
        </p>
      </section>

      <section
        class="flex flex-col gap-6 rounded-sm border border-secondary p-4"
        aria-label="Phase and trace details"
      >
        <PhasePanel
          :phase="frame?.phase ?? null"
          :bit-index="frame?.bitIndex"
          :mask="frame?.mask"
          :penalty="frame?.penalty"
        />
        <TraceStats :metadata="metadata" />
      </section>
    </div>
  </div>
</template>
