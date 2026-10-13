import { InfiniteScroll } from 'inertia-adapter-solid'
import { For } from 'solid-js'
import UserCard, { type User } from './UserCard'
export default function Manual(props: { users: { data: User[] } }) {
  return (
    <InfiniteScroll
      data="users"
      style={{ display: 'grid', gap: '20px' }}
      manual
      previous={(slot) => (
        <>
          <p>Has more previous items: {slot.hasMore.toString()}</p>
          <button onClick={slot.fetch}>{slot.loading ? 'Loading previous items...' : 'Load previous items'}</button>
        </>
      )}
      next={(slot) => (
        <>
          <p>Has more next items: {slot.hasMore.toString()}</p>
          <button onClick={slot.fetch}>{slot.loading ? 'Loading next items...' : 'Load next items'}</button>
        </>
      )}
    >
      <For each={props.users.data}>{(user) => <UserCard user={user} />}</For>
    </InfiniteScroll>
  )
}
