import { InfiniteScroll } from 'inertia-adapter-solid'
import { For, Show } from 'solid-js'
import UserCard, { type User } from './UserCard'
export default function Empty(props: { users: { data: User[] } }) {
  return (
    <div>
      <h1>Empty Dataset Test</h1>
      <InfiniteScroll
        data="users"
        style={{ display: 'grid', gap: '20px' }}
        loading={() => <div style={{ 'text-align': 'center', padding: '20px' }}>Loading...</div>}
      >
        <For each={props.users.data}>{(user) => <UserCard user={user} />}</For>
        <Show when={props.users.data.length === 0}>
          <div style={{ 'text-align': 'center', padding: '40px', color: '#666' }}>No users found.</div>
        </Show>
      </InfiniteScroll>
    </div>
  )
}
