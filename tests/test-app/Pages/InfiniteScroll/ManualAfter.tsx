import { InfiniteScroll } from 'inertia-adapter-solid'
import { For, Show } from 'solid-js'
import UserCard, { type User } from './UserCard'
export default function ManualAfter(props: { users: { data: User[] } }) {
  return (
    <InfiniteScroll
      data="users"
      style={{ display: 'grid', gap: '20px' }}
      manualAfter={2}
      next={(slot) => (
        <>
          <Show when={slot.loading}>
            <p>Loading...</p>
          </Show>
          <p>Manual mode: {slot.manualMode.toString()}</p>
          <Show when={slot.manualMode}>
            <button onClick={slot.fetch}>Load next items...</button>
          </Show>
        </>
      )}
    >
      <For each={props.users.data}>{(user) => <UserCard user={user} />}</For>
    </InfiniteScroll>
  )
}
