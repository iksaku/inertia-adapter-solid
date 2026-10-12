import { InfiniteScroll } from 'inertia-adapter-solid'
import { For } from 'solid-js'
import UserCard, { type User } from './UserCard'
export default function DualSibling(props: { users1: { data: User[] }; users2: { data: User[] } }) {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Dual Sibling InfiniteScroll</h1>
      <p style={{ 'margin-bottom': '20px' }}>Two InfiniteScroll components side by side, sharing the window scroll</p>
      <div style={{ display: 'grid', 'grid-template-columns': '1fr 1fr', gap: '40px' }}>
        <div>
          <h2>Users 1</h2>
          {/* @ts-expect-error The adapter's reactive accessor return type is not JSX-typed. */}
          <InfiniteScroll
            data="users1"
            style={{ display: 'grid', gap: '20px' }}
            manual
            next={(slot) => (
              <div style={{ 'text-align': 'center', padding: '20px' }}>
                <button onClick={slot.fetch} disabled={slot.loading}>
                  {slot.loading ? 'Loading...' : 'Load More Users 1'}
                </button>
              </div>
            )}
          >
            <For each={props.users1.data}>{(user) => <UserCard user={user} />}</For>
          </InfiniteScroll>
        </div>
        <div>
          <h2>Users 2</h2>
          {/* @ts-expect-error The adapter's reactive accessor return type is not JSX-typed. */}
          <InfiniteScroll
            data="users2"
            style={{ display: 'grid', gap: '20px' }}
            manual
            next={(slot) => (
              <div style={{ 'text-align': 'center', padding: '20px' }}>
                <button onClick={slot.fetch} disabled={slot.loading}>
                  {slot.loading ? 'Loading...' : 'Load More Users 2'}
                </button>
              </div>
            )}
          >
            <For each={props.users2.data}>{(user) => <UserCard user={user} />}</For>
          </InfiniteScroll>
        </div>
      </div>
    </div>
  )
}
