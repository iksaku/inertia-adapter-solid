import { InfiniteScroll } from 'inertia-adapter-solid'
import { For, createMemo } from 'solid-js'
import type { User } from './UserCard'
export default function ReverseShort(props: { users: { data: User[] } }) {
  const reversedUsers = createMemo(() => [...props.users.data].reverse())
  return (
    <div style={{ display: 'flex', 'flex-direction': 'column', height: '100vh' }}>
      <div style={{ padding: '10px', 'border-bottom': '1px solid #ccc', 'flex-shrink': 0 }}>Header</div>
      <div data-testid="scroll-container" style={{ flex: 1, 'overflow-y': 'auto' }}>
        {/* @ts-expect-error The adapter's reactive accessor return type is not JSX-typed. */}
        <InfiniteScroll
          data="users"
          style={{ display: 'grid', gap: '4px', padding: '20px' }}
          reverse
          loading={() => <div style={{ 'text-align': 'center', padding: '10px' }}>Loading...</div>}
        >
          <For each={reversedUsers()}>
            {(user) => (
              <div data-user-id={user.id} style={{ padding: '4px 8px', border: '1px solid #ddd', 'font-size': '13px' }}>
                {user.name}
              </div>
            )}
          </For>
        </InfiniteScroll>
      </div>
      <div style={{ padding: '10px', 'border-top': '1px solid #ccc', 'flex-shrink': 0 }}>Footer</div>
    </div>
  )
}
