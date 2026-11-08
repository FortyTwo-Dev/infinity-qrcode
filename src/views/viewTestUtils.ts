import type { DOMWrapper, mount } from '@vue/test-utils'

type Wrapper = ReturnType<typeof mount>

/**
 * Read the accessible failure surface of a mounted view, or undefined when the
 * view currently shows no failure.
 */
export function alertText(source: Wrapper): string | undefined {
  const alert = source.find('[role="alert"]')
  return alert.exists() ? alert.text() : undefined
}

/** Find the retry action of a mounted view by its accessible name. */
export function retryButton(source: Wrapper): DOMWrapper<Element> | undefined {
  return source.findAll('button').find((node) => {
    const accessible = node.attributes('aria-label') ?? node.attributes('title') ?? node.text()
    return /retry/i.test(accessible)
  })
}
