import type { ErrorCorrectionLevel } from '@/types/qr'

/**
 * Message keys for the error correction levels, indexed by level value. The
 * keys live in the `generator.levels` section of both locales.
 */
export const LEVEL_LABELS: Record<ErrorCorrectionLevel, string> = {
  L: 'generator.levels.low',
  M: 'generator.levels.medium',
  Q: 'generator.levels.quartile',
  H: 'generator.levels.high',
}
