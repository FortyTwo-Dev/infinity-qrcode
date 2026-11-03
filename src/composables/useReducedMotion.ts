import { onBeforeUnmount, onMounted, ref } from 'vue'

/** Tracks the user's reduced-motion preference and keeps it up to date. */
export function useReducedMotion() {
  const reduced = ref(false)
  let query: MediaQueryList | null = null

  function update() {
    reduced.value = query?.matches ?? false
  }

  onMounted(() => {
    query = window.matchMedia('(prefers-reduced-motion: reduce)')
    update()
    query.addEventListener('change', update)
  })

  onBeforeUnmount(() => {
    query?.removeEventListener('change', update)
    query = null
  })

  return reduced
}
