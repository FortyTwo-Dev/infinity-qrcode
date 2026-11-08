/** Catalog keys for the runtime failures the QR views can display. */
export type QrErrorMessageKey =
  | 'common.errors.capacity'
  | 'generator.errors.initialization'
  | 'generator.errors.generation'
  | 'learn.errors.initialization'
  | 'learn.errors.trace'

/** Fallback keys accepted by the classifier for a non-capacity failure. */
export type QrFailureKey = Extract<
  QrErrorMessageKey,
  'generator.errors.generation' | 'learn.errors.trace'
>

/** Classify an engine failure into a stable catalog key. */
export function classifyQrError(
  cause: unknown,
  fallback: QrFailureKey,
): QrFailureKey | 'common.errors.capacity' {
  const message = cause instanceof Error ? cause.message : typeof cause === 'string' ? cause : ''

  return message.startsWith('data too long') ? 'common.errors.capacity' : fallback
}
