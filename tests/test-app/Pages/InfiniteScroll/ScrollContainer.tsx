import { InfiniteScroll } from 'inertia-adapter-solid'
import { For } from 'solid-js'
import UserCard, { type User } from './UserCard'
export default function ScrollContainer(props: { users: { data: User[] } }) {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Infinite Scroll in Container</h1>
      <p>This component scrolls within a fixed-height container, not the full page.</p>
      <div
        data-testid="scroll-container"
        style={{
          height: '400px',
          width: '100%',
          border: '2px solid #ccc',
          'overflow-y': 'auto',
          background: '#f9f9f9',
          padding: '10px',
        }}
      >
        {/* @ts-expect-error The adapter's reactive accessor return type is not JSX-typed. */}
        <InfiniteScroll
          data="users"
          style={{ display: 'grid', gap: '10px' }}
          loading={() => (
            <div style={{ 'text-align': 'center', padding: '20px', color: '#666' }}>Loading more users...</div>
          )}
        >
          <For each={props.users.data}>{(user) => <UserCard user={user} />}</For>
        </InfiniteScroll>
      </div>
      <p style={{ 'margin-top': '20px' }}>Content below the scroll container to verify page doesn't scroll.</p>
    </div>
  )
}
