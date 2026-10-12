import { createSignal, onMount, onCleanup } from 'solid-js'
import { Form } from 'inertia-adapter-solid'
export default () => {
  const [showProgress, setShowProgress] = createSignal<boolean | undefined>(undefined)
  const [nprogressVisible, setNprogressVisible] = createSignal(false)
  const [nprogressAppearances, setNprogressAppearances] = createSignal(0)
  let observerRef: (MutationObserver | null) | null = null
  function disableProgress() {
    setShowProgress(false)
  }
  onMount(() => {
    observerRef = new MutationObserver(() => {
      const nprogressElement = document.querySelector('#nprogress') as HTMLElement | null
      const nprogressIsCurrentlyVisible =
        nprogressElement &&
        ('popover' in HTMLElement.prototype
          ? nprogressElement.matches(':popover-open')
          : nprogressElement.style.display !== 'none')
      if (nprogressIsCurrentlyVisible) {
        if (!nprogressVisible()) {
          setNprogressVisible(true)
          setNprogressAppearances((previousCount) => previousCount + 1)
        }
      } else {
        setNprogressVisible(false)
      }
    })
    observerRef.observe(document.body, { childList: true, subtree: true })
    onCleanup(() => observerRef?.disconnect())
  })
  return (
    <Form action="/form-component/progress" method="post" showProgress={showProgress()}>
      <h1>Progress</h1>

      <div>
        Nprogress appearances: <span id="nprogress-appearances">{nprogressAppearances()}</span>
      </div>

      <div>
        <button type="button" onClick={disableProgress}>
          Disable Progress
        </button>
        <button type="submit">Submit</button>
      </div>
    </Form>
  )
}
