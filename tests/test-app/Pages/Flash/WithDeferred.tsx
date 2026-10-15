import { createSignal, onMount, onCleanup } from 'solid-js'
import { Deferred, router, usePage } from 'inertia-adapter-solid'
export default (props0: {
  data?: string
}) => {
  const page = usePage()
  const [flashEventCount, setFlashEventCount] = createSignal(0)
  onMount(() => {
    onCleanup(
      router.on('flash', () => {
        setFlashEventCount((n) => n + 1)
      }),
    )
  })
  return (
    <div>
      <span id="flash">{JSON.stringify(page.flash)}</span>
      <span id="flash-event-count">{flashEventCount()}</span>

      <Deferred data="data" fallback={<div id="loading">Loading...</div>}>
        <div id="data">{props0.data}</div>
      </Deferred>
    </div>
  )
}
