import { InfiniteScroll } from 'inertia-adapter-solid'
import { For } from 'solid-js'
import UserCard, { type User } from './UserCard'
export default function Invisible(props: { users: { data: User[] } }) {
  return (
    <div>
      <h1>Infinite Scroll with Invisible First Child</h1>
      <InfiniteScroll
        data="users"
        style={{ display: 'grid', gap: '20px' }}
        loading={() => <div style={{ 'text-align': 'center', padding: '20px' }}>Loading...</div>}
      >
        <div style={{ display: 'none' }}>Hidden first element</div>
        <For each={props.users.data}>{(user) => <UserCard user={user} />}</For>
      </InfiniteScroll>
    </div>
  )
}
