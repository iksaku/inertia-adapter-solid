import { InfiniteScroll, router } from 'inertia-adapter-solid'
import { For, Show, createSignal } from 'solid-js'
import UserCard, { type User } from './UserCard'
export default function UnmountAfterMutation(props: { users: { data: User[] } }) {
  const [show, setShow] = createSignal(true)
  const [items, setItems] = createSignal(props.users.data)
  const addUser = () => setItems((current) => [...current, { id: 1000, name: 'Added User' }])
  return (
    <div>
      <button
        onClick={() => {
          addUser()
          setTimeout(() => setShow(false))
        }}
      >
        Add User and Unmount
      </button>
      <button
        onClick={() => {
          addUser()
          router.visit('/')
        }}
      >
        Add User and Visit Home
      </button>
      <p id="status">Mounted: {String(show())}</p>
      <Show when={show()}>
        <InfiniteScroll data="users" style={{ display: 'grid', gap: '20px' }}>
          <For each={items()}>{(user) => <UserCard user={user} />}</For>
        </InfiniteScroll>
      </Show>
    </div>
  )
}
