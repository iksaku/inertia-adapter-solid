import { createSignal, onMount } from 'solid-js'
import { Link } from 'inertia-adapter-solid'
export default () => {
  const [documentScrollTop, setDocumentScrollTop] = createSignal(0)
  const [documentScrollLeft, setDocumentScrollLeft] = createSignal(0)
  onMount(() => {
    document.addEventListener('scroll', handleScrollEvent)
  })
  const handleScrollEvent = () => {
    setDocumentScrollTop(document.documentElement.scrollTop)
    setDocumentScrollLeft(document.documentElement.scrollLeft)
  }
  return (
    <div>
      <span class="text">This is the links page that demonstrates url fragment behaviour</span>
      <div style={{ width: '200vw', height: '200vh', 'margin-top': '50vh' }}>
        <button onClick={handleScrollEvent}>Update scroll positions</button>
        {/* prettier-ignore */}
        <div class="document-position">
          Document scroll position is {documentScrollLeft()} & {documentScrollTop()}
        </div>
        <Link href="/links/url-fragments#target" class="basic">
          Basic link
        </Link>
        <Link href="#target" class="fragment">
          Fragment link
        </Link>
        <Link href="/links/url-fragments#non-existent-fragment" class="non-existent-fragment">
          Non-existent fragment link
        </Link>

        <div id="target">This is the element with id 'target'</div>
      </div>
    </div>
  )
}
