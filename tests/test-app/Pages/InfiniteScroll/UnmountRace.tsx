import { InfiniteScroll } from 'inertia-adapter-solid'
import { For, Show, createSignal, onMount, onCleanup } from 'solid-js'
import UserCard, { type User } from './UserCard'
const LifecycleMarker = () => {
  onMount(() => console.log('marker mounted'))
  onCleanup(() => console.log('marker destroyed'))
  return null
}
export default function UnmountRace(props: { users: { data: User[] } }) {
  const [show, setShow] = createSignal(false)
  const [cycleCount, setCycleCount] = createSignal(0)
  const cycleMount = () => {
    setShow(true)
    setShow(false)
    setCycleCount((c) => c + 1)
  }
  return (
    <div>
      <button onClick={cycleMount}>Cycle Mount</button>
      <p id="cycle-count">Cycles: {cycleCount()}</p>
      <Show when={show()}>
        <LifecycleMarker />
        {/* @ts-expect-error The adapter's reactive accessor return type is not JSX-typed. */}
        <InfiniteScroll data="users" style={{ display: 'grid', gap: '20px' }}>
          <For each={props.users.data}>{(user) => <UserCard user={user} />}</For>
        </InfiniteScroll>
      </Show>
    </div>
  )
}
