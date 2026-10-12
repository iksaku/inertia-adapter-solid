import { Link, router } from 'inertia-adapter-solid'
import { onMount, onCleanup } from 'solid-js'

export default function NavigateEvent() {
  onMount(() => {
    const cleanup = router.on('navigate', (event) => console.log(String(event.detail.cached)))
    onCleanup(cleanup)
  })
  return (
    <>
      <Link href="/prefetch/navigate-event/cached" prefetch="mount">
        Prefetched Link
      </Link>
      <Link href="/prefetch/navigate-event/fresh">Regular Link</Link>
    </>
  )
}
