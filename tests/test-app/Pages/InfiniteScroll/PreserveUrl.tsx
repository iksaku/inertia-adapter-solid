import { InfiniteScroll } from 'inertia-adapter-solid'
import { For } from 'solid-js'
import UserCard, { type User } from './UserCard'
export default function PreserveUrl(props: { users: { data: User[] } }) {
  return (
    // @ts-expect-error The adapter's reactive accessor return type is not JSX-typed.
    <InfiniteScroll
      data="users"
      preserveUrl
      style={{ display: 'grid', gap: '20px' }}
      loading={() => <div style={{ 'text-align': 'center', padding: '20px' }}>Loading...</div>}
    >
      <For each={props.users.data}>{(user) => <UserCard user={user} />}</For>
    </InfiniteScroll>
  )
}
