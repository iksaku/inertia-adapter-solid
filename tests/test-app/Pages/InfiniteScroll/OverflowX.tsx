import { InfiniteScroll } from 'inertia-adapter-solid'
import { For } from 'solid-js'
import type { User } from './UserCard'
export default function OverflowX(props: { users: { data: User[] } }) {
  return (
    <div style={{ 'overflow-x': 'hidden' }}>
      {/* @ts-expect-error The adapter's reactive accessor return type is not JSX-typed. */}
      <InfiniteScroll data="users">
        <For each={props.users.data}>
          {(user) => (
            <div data-user-id={user.id}>
              <div>{user.name}</div>
            </div>
          )}
        </For>
      </InfiniteScroll>
    </div>
  )
}
