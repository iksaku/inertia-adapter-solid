import { createSignal, onMount, onCleanup } from 'solid-js'
import { router, usePage } from 'inertia-adapter-solid'
export default (props0: {
  count: number
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
  const reloadWithSameFlash = () => {
    router.reload({ only: ['count'], data: { flashType: 'same', count: Date.now() } })
  }
  const reloadWithDifferentFlash = () => {
    router.reload({ only: ['count'], data: { flashType: 'different', count: Date.now() } })
  }
  const reloadWithoutFlash = () => {
    router.reload({ only: ['count'], data: { flashType: 'none', count: Date.now() } })
  }
  return (
    <div>
      <span id="flash">{JSON.stringify(page.flash)}</span>
      <span id="flash-event-count">{flashEventCount()}</span>
      <span id="count">{props0.count}</span>

      <button onClick={reloadWithSameFlash}>Reload with same flash</button>
      <button onClick={reloadWithDifferentFlash}>Reload with different flash</button>
      <button onClick={reloadWithoutFlash}>Reload without flash</button>
    </div>
  )
}
