import { For, onCleanup } from 'solid-js'
import { router } from 'inertia-adapter-solid'
// The scroll position the container jumps to before the continuous scrolling starts, so the
// preserved position never depends on how many interval ticks the browser managed to run.
const scrollBaseline = 100
export default (props0: {
  page: number
}) => {
  let scrollIntervalRef: ReturnType<typeof setInterval> | null = null
  let navigationTimeout: ReturnType<typeof setTimeout> | undefined
  onCleanup(() => {
    if (scrollIntervalRef) clearInterval(scrollIntervalRef)
    clearTimeout(navigationTimeout)
  })
  const startScrollingAndNavigate = () => {
    const container = document.getElementById('scroll-container')!
    const nextPage = props0.page === 1 ? 2 : 1
    container.scrollTop = scrollBaseline
    // Keep scrolling while the visit is in flight
    scrollIntervalRef = setInterval(() => {
      container.scrollTop += 10
    }, 10)
    navigationTimeout = setTimeout(() => {
      router.visit(`/scroll-region-preserve-url/${nextPage}`, {
        preserveScroll: true,
        preserveState: true,
        preserveUrl: true,
        onSuccess: () => {
          if (scrollIntervalRef) {
            clearInterval(scrollIntervalRef)
            scrollIntervalRef = null
          }
        },
      })
    }, 150)
  }
  return (
    <div
      scroll-region=""
      id="scroll-container"
      style={{ height: '300px', 'overflow-y': 'auto', border: '1px solid #ccc' }}
    >
      <div style={{ padding: '10px' }}>
        <div class="page-number">Page: {props0.page}</div>
        <div id="scroll-baseline">Scroll baseline: {scrollBaseline}</div>
        <button id="scroll-and-navigate" onClick={startScrollingAndNavigate}>
          Start scrolling and navigate
        </button>
        {
          <For each={Array.from({ length: 50 })}>
            {(_, i) => <div style={{ padding: '20px', 'border-bottom': '1px solid #eee' }}>Item {i() + 1}</div>}
          </For>
        }
      </div>
    </div>
  )
}
