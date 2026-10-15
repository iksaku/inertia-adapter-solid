import { InfiniteScroll } from 'inertia-adapter-solid'
import { For } from 'solid-js'
import UserCard, { type User } from './UserCard'
export default function TriggerEndBuffer(props: { users: { data: User[] } }) {
  return (
    <InfiniteScroll
      data="users"
      buffer={200}
      onlyNext
      style={{ display: 'grid', gap: '20px' }}
      loading={() => <div style={{ 'text-align': 'center', padding: '20px' }}>Loading...</div>}
    >
      <For each={props.users.data}>{(user) => <UserCard user={user} />}</For>
    </InfiniteScroll>
  )
}
