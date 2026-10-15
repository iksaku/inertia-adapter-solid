import { InfiniteScroll } from 'inertia-adapter-solid'
import { For, createMemo } from 'solid-js'
import UserCard, { type User } from './UserCard'
export default function Reverse(props: { users: { data: User[] } }) {
  const reversedUsers = createMemo(() => [...props.users.data].reverse())
  return (
    <InfiniteScroll
      data="users"
      style={{ display: 'grid', gap: '20px' }}
      reverse
      autoScroll={false}
      loading={() => <div style={{ 'text-align': 'center', padding: '20px' }}>Loading...</div>}
    >
      <For each={reversedUsers()}>{(user) => <UserCard user={user} />}</For>
    </InfiniteScroll>
  )
}
