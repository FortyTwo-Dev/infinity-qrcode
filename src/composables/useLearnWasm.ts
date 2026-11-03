import { onMounted, ref } from 'vue'
import initLearn, { LearnTrace } from 'iqrcode-learn-wasm'
import learnWasmUrl from 'iqrcode-learn-wasm/iqrcode_learn_wasm_bg.wasm?url'

import type { ErrorCorrectionLevel } from '@/types/qr'
import type { LearnFrameData, LearnPhase, TraceMetadata } from '@/types/learn'

let readyPromise: Promise<void> | null = null

/** Initialize the learn WASM module once. */
export function loadLearnWasm(): Promise<void> {
  readyPromise ??= initLearn({ module_or_path: learnWasmUrl }).then(() => undefined)
  return readyPromise
}

/** Create a trace. The caller owns the returned object and must free it. */
export function createLearnTrace(
  data: string,
  level: ErrorCorrectionLevel,
  version: number | null,
  stride: number,
  maskCandidates: boolean,
): LearnTrace {
  return new LearnTrace(data, level, version ?? undefined, stride, 100_000, maskCandidates)
}

/** Read a frame into plain JavaScript values and free the WASM frame. */
export function readLearnFrame(trace: LearnTrace, index: number): LearnFrameData {
  const frame = trace.frame(index)
  try {
    return {
      matrix: frame.matrix(),
      size: frame.size(),
      highlight: Array.from(frame.highlight()),
      phase: frame.phase() as LearnPhase,
      bitIndex: frame.bit_index(),
      mask: frame.mask(),
      penalty: frame.penalty(),
    }
  } finally {
    frame.free()
  }
}

/** Read trace-level metadata. */
export function readTraceMetadata(trace: LearnTrace): TraceMetadata {
  return {
    version: trace.version(),
    size: trace.size(),
    mask: trace.mask(),
    level: trace.level(),
    blocks: trace.blocks(),
    dataCodewords: trace.data_codewords(),
    eccPerBlock: trace.ecc_per_block(),
    totalCodewords: trace.total_codewords(),
    dataModules: trace.data_modules(),
    segments: trace.segments(),
  }
}

/** Reactive loading state for the learn module. */
export function useLearnWasm() {
  const ready = ref(false)
  const error = ref<string | null>(null)

  onMounted(async () => {
    try {
      await loadLearnWasm()
      ready.value = true
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : String(cause)
    }
  })

  return { ready, error }
}
