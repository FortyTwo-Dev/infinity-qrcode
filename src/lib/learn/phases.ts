import type { LearnPhase } from '@/types/learn'

export interface PhaseInfo {
  title: string
  description: string
  math?: string
  formula?: string
}

/** Human-readable explanation for each construction phase. */
export const PHASE_INFO: Record<LearnPhase, PhaseInfo> = {
  empty: {
    title: 'Empty grid',
    description:
      'The grid starts empty. Its size is chosen from the payload length and the correction level.',
    math: 'The encoder picks the smallest version whose capacity fits the payload. It also splits the text into numeric, alphanumeric and byte runs with a dynamic-programming pass that minimises the number of encoded bits.',
  },
  finders: {
    title: 'Finder patterns',
    description:
      'Three large squares mark the corners so a scanner can find the code and its orientation.',
    math: 'Each finder is a fixed 7×7 pattern: a dark border, a light ring and a 3×3 dark centre. The 1:1:3:1:1 ratio lets a scanner detect the pattern at any scale.',
  },
  timing: {
    title: 'Timing patterns',
    description:
      'Alternating modules between the finders define the module grid and help measure it.',
    math: 'Modules on row 6 and column 6 alternate with the coordinate: dark when the coordinate is even.',
    formula: 'dark(x) = x mod 2 = 0',
  },
  alignment: {
    title: 'Alignment patterns',
    description: 'Smaller squares correct the perspective on larger versions.',
    math: '5×5 concentric squares are placed on a grid whose positions depend on the version. Version 1 has none.',
    formula:
      'n = version / 7 + 2\nstep = ((version * 8 + n * 3 + 5) / (n * 4 - 4)) * 2\nsize = 17 + 4 * version\npositions = 6, then size - 7 - i * step',
  },
  version_info: {
    title: 'Version information',
    description: 'The version number is written twice for versions 7 and above.',
    math: 'Six version bits are protected by an 18-bit BCH(18,6) code, written in two copies next to the finders.',
    formula: 'generator = 0x1F25\nbits = (version << 12) | remainder',
  },
  format_reserved: {
    title: 'Format area reserved',
    description: 'Space is reserved for the correction level and the mask number.',
    math: 'Fifteen format modules are reserved around the finders, and the dark module is set below the top-left finder.',
  },
  data_placement: {
    title: 'Data placement',
    description: 'Encoded data and error-correction bits are written into the remaining modules.',
    math: 'Codewords are placed in 2-module-wide columns from the bottom-right, alternating up and down, skipping function modules and the vertical timing column 6. The error-correction bytes come from a Reed-Solomon code over GF(256), built on the primitive polynomial 0x11D.',
    formula:
      'GF(256): p(x) = x^8 + x^4 + x^3 + x^2 + 1 (0x11D)\ngenerator = product of (x - alpha^i) for i in 0..ecc_len',
  },
  mask_candidate: {
    title: 'Mask evaluation',
    description: 'Each mask is applied and scored. The lowest penalty wins.',
    math: 'Each of the eight masks XORs the data modules with a formula. The masked matrix is then scored with the four standard penalties.',
    formula:
      '0: (x + y) % 2 = 0\n1: y % 2 = 0\n2: x % 3 = 0\n3: (x + y) % 3 = 0\n4: (y / 2 + x / 3) % 2 = 0\n5: (x * y) % 2 + (x * y) % 3 = 0\n6: ((x * y) % 2 + (x * y) % 3) % 2 = 0\n7: ((x + y) % 2 + (x * y) % 3) % 2 = 0\n\nN1: 3 + (run - 5) per run of 5 or more\nN2: 3 per 2x2 block of one colour\nN3: 40 per 1:1:3:1:1 pattern\nN4: 10 per 5% away from 50% dark',
  },
  mask_chosen: {
    title: 'Mask selected',
    description: 'The best mask is kept for the final code.',
    math: 'The candidate with the lowest penalty is kept and the other seven are discarded.',
  },
  format_info: {
    title: 'Format information',
    description: 'The correction level and mask number are written into the format area.',
    math: 'The two level bits and the three mask bits are protected by a BCH(15,5) code, then XORed with a fixed mask. The 15 bits are written twice.',
    formula: 'generator = 0x537\nbits = BCH15_5((level << 3) | mask) ^ 0x5412',
  },
  final: {
    title: 'Finished QR code',
    description: 'The matrix is complete and matches the generator output.',
    math: 'The matrix is now complete: finders, timing, alignment, format and masked data are all in place.',
  },
}
