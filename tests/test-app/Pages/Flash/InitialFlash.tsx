import { createSignal, onMount, onCleanup } from 'solid-js'
import { router, usePage } from 'inertia-adapter-solid'
export default () => {
  const page = usePage()
  const [flashEvents, setFlashEvents] = createSignal<Record<string, unknown>[]>([])
  onMount(() => {
    onCleanup(
      router.on('flash', (e) => {
        setFlashEvents((events) => [...events, e.detail.flash])
      }),
    )
  })
  return (
    <div>
      <span id="flash">{page.flash ? JSON.stringify(page.flash) : 'no-flash'}</span>
      <span id="flash-events">{JSON.stringify(flashEvents())}</span>
    </div>
  )
}
