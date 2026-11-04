import type { LearnPhase } from '@/types/learn'

/** Fields of the phase explanation beyond the always-present title and description. */
type PhaseTextField = 'detail' | 'math' | 'formula'

/**
 * Message catalog keys describing a construction phase. Every field is a
 * translation key resolved by the UI layer with vue-i18n; none is display text.
 */
export interface PhaseInfo {
  title: string
  description: string
  detail?: string
  math?: string
  formula?: string
}

/** Catalog key of one explanation field for a phase. */
function phaseKey(phase: LearnPhase, field: 'title' | 'description' | PhaseTextField): string {
  return `learn.phases.${phase}.${field}`
}

function keys(phase: LearnPhase, fields: readonly PhaseTextField[] = []): PhaseInfo {
  const info: PhaseInfo = {
    title: phaseKey(phase, 'title'),
    description: phaseKey(phase, 'description'),
  }
  for (const field of fields) info[field] = phaseKey(phase, field)
  return info
}

/** Catalog keys of the human-readable explanation for each construction phase. */
export const PHASE_INFO: Record<LearnPhase, PhaseInfo> = {
  empty: keys('empty', ['detail']),
  finders: keys('finders', ['detail']),
  timing: keys('timing', ['detail', 'math', 'formula']),
  alignment: keys('alignment', ['detail', 'math', 'formula']),
  version_info: keys('version_info', ['detail', 'math', 'formula']),
  format_reserved: keys('format_reserved', ['detail']),
  data_placement: keys('data_placement', ['detail', 'math', 'formula']),
  mask_candidate: keys('mask_candidate', ['detail', 'math', 'formula']),
  mask_chosen: keys('mask_chosen', ['detail']),
  format_info: keys('format_info', ['detail', 'math', 'formula']),
  final: keys('final', ['detail']),
}
