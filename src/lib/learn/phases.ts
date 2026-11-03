import type { LearnPhase } from '@/types/learn'

export interface PhaseInfo {
  title: string
  description: string
}

/** Human-readable explanation for each construction phase. */
export const PHASE_INFO: Record<LearnPhase, PhaseInfo> = {
  empty: {
    title: 'Empty grid',
    description:
      'The grid starts empty. Its size is chosen from the payload length and the correction level.',
  },
  finders: {
    title: 'Finder patterns',
    description:
      'Three large squares mark the corners so a scanner can find the code and its orientation.',
  },
  timing: {
    title: 'Timing patterns',
    description:
      'Alternating modules between the finders define the module grid and help measure it.',
  },
  alignment: {
    title: 'Alignment patterns',
    description: 'Smaller squares correct the perspective on larger versions.',
  },
  format_reserved: {
    title: 'Format area reserved',
    description: 'Space is reserved for the correction level and the mask number.',
  },
  data_placement: {
    title: 'Data placement',
    description: 'Encoded data and error-correction bits are written into the remaining modules.',
  },
  mask_candidate: {
    title: 'Mask evaluation',
    description: 'Each mask is applied and scored. The lowest penalty wins.',
  },
  mask_chosen: {
    title: 'Mask selected',
    description: 'The best mask is kept for the final code.',
  },
  format_info: {
    title: 'Format information',
    description: 'The correction level and mask number are written into the format area.',
  },
  final: {
    title: 'Finished QR code',
    description: 'The matrix is complete and matches the generator output.',
  },
}
