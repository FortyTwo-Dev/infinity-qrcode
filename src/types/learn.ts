/** Stable phase keys exposed by `LearnFrame.phase()`. */
export type LearnPhase =
  | 'empty'
  | 'finders'
  | 'timing'
  | 'alignment'
  | 'version_info'
  | 'format_reserved'
  | 'data_placement'
  | 'mask_candidate'
  | 'mask_chosen'
  | 'format_info'
  | 'final'

/** A single construction frame, copied into plain JavaScript values. */
export interface LearnFrameData {
  matrix: Uint8Array
  size: number
  highlight: number[]
  phase: LearnPhase
  bitIndex?: number
  mask?: number
  penalty?: number
}

/** Trace-level metadata shown in the stats panel. */
export interface TraceMetadata {
  version: number
  size: number
  mask: number
  level: string
  blocks: number
  dataCodewords: number
  eccPerBlock: number
  totalCodewords: number
  dataModules: number
  segments: string
}
