import { type VisitOptions, router } from '@inertiajs/core'
import { batch, createSignal, onCleanup, onMount } from 'solid-js'

interface InertiaUsePrefetchProps {
  get isPrefetching(): boolean
  get isPrefetched(): boolean
  get lastUpdatedAt(): number | null

  flush(): void
}

export default function usePrefetch(options: VisitOptions = {}): InertiaUsePrefetchProps {
  const cached = typeof window === 'undefined' ? null : router.getCached(window.location.pathname, options)
  const inFlight = typeof window === 'undefined' ? null : router.getPrefetching(window.location.pathname, options)

  const [isPrefetching, setPrefetching] = createSignal<boolean>(inFlight !== null)
  const [isPrefetched, setPrefetched] = createSignal<boolean>(cached !== null)
  const [lastUpdatedAt, setLastUpdatedAt] = createSignal<number | null>(cached?.staleTimestamp || null)

  let cleanupPrefetchingListener: () => void
  let cleanupPrefetchedListener: () => void

  onMount(() => {
    cleanupPrefetchingListener = router.on('prefetching', (e) => {
      if (e.detail.visit.url.pathname === window.location.pathname) {
        setPrefetching(true)
      }
    })

    cleanupPrefetchedListener = router.on('prefetched', (e) => {
      if (e.detail.visit.url.pathname === window.location.pathname) {
        batch(() => {
          setPrefetching(false)
          setPrefetched(true)
          setLastUpdatedAt(e.detail.fetchedAt)
        })
      }
    })
  })

  onCleanup(() => {
    cleanupPrefetchingListener()
    cleanupPrefetchedListener()
  })

  return {
    get isPrefetching() {
      return isPrefetching()
    },
    get isPrefetched() {
      return isPrefetched()
    },
    get lastUpdatedAt() {
      return lastUpdatedAt()
    },
    flush: () => router.flush(window.location.pathname, options),
  }
}
