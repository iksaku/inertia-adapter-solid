import { createSignal, onMount, onCleanup } from 'solid-js'
import { router } from 'inertia-adapter-solid'
export default () => {
  const [documentScrollTop, setDocumentScrollTop] = createSignal(0)
  const [documentScrollLeft, setDocumentScrollLeft] = createSignal(0)
  const handleScrollEvent = () => {
    setDocumentScrollLeft(document.documentElement.scrollLeft)
    setDocumentScrollTop(document.documentElement.scrollTop)
  }
  onMount(() => {
    document.addEventListener('scroll', handleScrollEvent)
    onCleanup(() => {
      document.removeEventListener('scroll', handleScrollEvent)
    })
  })
  const basicVisit = (e: MouseEvent) => {
    e.preventDefault()
    router.visit('/visits/url-fragments#target')
  }
  const fragmentVisit = (e: MouseEvent) => {
    e.preventDefault()
    router.visit('#target')
  }
  const nonExistentFragmentVisit = (e: MouseEvent) => {
    e.preventDefault()
    router.visit('/visits/url-fragments#non-existent-fragment')
  }
  const basicGetVisit = (e: MouseEvent) => {
    e.preventDefault()
    router.get('/visits/url-fragments#target')
  }
  const fragmentGetVisit = (e: MouseEvent) => {
    e.preventDefault()
    router.get('#target')
  }
  const nonExistentFragmentGetVisit = (e: MouseEvent) => {
    e.preventDefault()
    router.get('/visits/url-fragments#non-existent-fragment')
  }
  return (
    <div>
      <span class="text">This is the page that demonstrates url fragment behaviour using manual visits</span>
      <div
        style={{
          width: '200vw',
          height: '200vh',
          'margin-top': '50vh',
        }}
      >
        <button onClick={handleScrollEvent}>Update scroll positions</button>
        {/* prettier-ignore */}
        <div class="document-position">
          Document scroll position is {documentScrollLeft()} & {documentScrollTop()}
        </div>
        <a href="#" onClick={basicVisit} class="basic">
          Basic visit
        </a>
        <a href="#" onClick={fragmentVisit} class="fragment">
          Fragment visit
        </a>
        <a href="#" onClick={nonExistentFragmentVisit} class="non-existent-fragment">
          Non-existent fragment visit
        </a>

        <a href="#" onClick={basicGetVisit} class="basic-get">
          Basic GET visit
        </a>
        <a href="#" onClick={fragmentGetVisit} class="fragment-get">
          Fragment GET visit
        </a>
        <a href="#" onClick={nonExistentFragmentGetVisit} class="non-existent-fragment-get">
          Non-existent fragment GET visit
        </a>

        <div id="target">This is the element with id 'target'</div>
      </div>
    </div>
  )
}
