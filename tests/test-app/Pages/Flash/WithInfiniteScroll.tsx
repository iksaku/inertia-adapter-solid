import { createSignal, onMount, onCleanup, For } from 'solid-js'
import { InfiniteScroll, router, usePage } from 'inertia-adapter-solid'
export default (props0: {
  users: {
    data: {
      id: number
      name: string
    }[]
  }
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

      <InfiniteScroll data="users" style={{ display: 'grid', gap: '20px' }}>
        {
          <For each={props0.users.data}>
            {(user) => <div style={{ height: '15vh', border: '1px solid #ccc' }}>{user.name}</div>}
          </For>
        }
      </InfiniteScroll>
    </div>
  )
}
