import { createSignal, createEffect, on, For } from 'solid-js'
import { Link, router } from 'inertia-adapter-solid'
const rows = Array.from({ length: 100 }, (_, index) => `Row ${index + 1}`)
export default () => {
  const [firstVisibleRow, setFirstVisibleRow] = createSignal(0)
  createEffect(
    on(
      () => [firstVisibleRow()],
      () => {
        router.remember(firstVisibleRow(), 'firstVisibleRow')
      },
    ),
  )
  const onScroll = (
    event: Event & {
      currentTarget: HTMLDivElement
    },
  ) => {
    setFirstVisibleRow(Math.floor(event.currentTarget.scrollTop / 40))
  }
  return (
    <div>
      <Link href="/dump/get">Navigate away</Link>
      <p>First visible row: {firstVisibleRow()}</p>
      <div id="rows" scroll-region="" style={{ height: '200px', 'overflow-y': 'auto' }} onScroll={onScroll}>
        {<For each={rows}>{(row) => <div style={{ height: '40px' }}>{row}</div>}</For>}
      </div>
    </div>
  )
}
