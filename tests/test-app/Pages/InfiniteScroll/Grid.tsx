import { InfiniteScroll } from 'inertia-adapter-solid'
import { For } from 'solid-js'
import UserCard, { type User } from './UserCard'
export default function Grid(props: { users: { data: User[] } }) {
  return (
    <InfiniteScroll
      data="users"
      style={{ display: 'grid', 'grid-template-columns': 'repeat(4, 1fr)', gap: '20px' }}
      loading={() => (
        <div style={{ 'grid-column': '1 / -1', 'text-align': 'center', padding: '20px' }}>Loading more users...</div>
      )}
    >
      {() => <For each={props.users.data}>{(user) => <UserCard user={user} />}</For>}
    </InfiniteScroll>
  )
}
