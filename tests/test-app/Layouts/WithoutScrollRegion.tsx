import { createSignal, onMount, onCleanup, type JSX } from 'solid-js'
export default (props0: {
  children: JSX.Element
}) => {
  const [documentScrollTop, setDocumentScrollTop] = createSignal(0)
  const [documentScrollLeft, setDocumentScrollLeft] = createSignal(0)
  const [slotScrollTop, setSlotScrollTop] = createSignal(0)
  const [slotScrollLeft, setSlotScrollLeft] = createSignal(0)
  const handleScrollEvent = () => {
    setDocumentScrollLeft(document.documentElement.scrollLeft)
    setDocumentScrollTop(document.documentElement.scrollTop)
    const slot = document.getElementById('slot')
    if (slot) {
      setSlotScrollTop(slot.scrollTop)
      setSlotScrollLeft(slot.scrollLeft)
    }
  }
  onMount(() => {
    document.addEventListener('scroll', handleScrollEvent)
    onCleanup(() => {
      document.removeEventListener('scroll', handleScrollEvent)
    })
  })
  return (
    <div style={{ width: '200vw' }}>
      <span class="layout-text">Without scroll regions</span>
      <button onClick={handleScrollEvent}>Update scroll positions</button>
      <div class="document-position">
        Document scroll position is {documentScrollLeft()} & {documentScrollTop()}
      </div>
      <div style={{ height: '200vh' }}>
        <span class="slot-position">
          Slot scroll position is {slotScrollLeft()} & {slotScrollTop()}
        </span>
        <div id="slot" style={{ height: '100px', width: '500px', overflow: 'scroll' }} onScroll={handleScrollEvent}>
          {props0.children}
        </div>
      </div>
    </div>
  )
}
