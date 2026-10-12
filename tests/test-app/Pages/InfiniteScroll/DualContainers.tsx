import { InfiniteScroll } from 'inertia-adapter-solid'
import { For } from 'solid-js'
import UserCard, { type User } from './UserCard'
export default function DualContainers(props: { users1: { data: User[] }; users2: { data: User[] } }) {
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <h2>Users1 Container</h2>
          <div
            data-testid="scroll-container-1"
            style={{
              height: '400px',
              width: '100%',
              border: '2px solid #3b82f6',
              'overflow-y': 'auto',
              background: '#f0f9ff',
              padding: '10px',
            }}
          >
            {/* @ts-expect-error The adapter's reactive accessor return type is not JSX-typed. */}
            <InfiniteScroll
              data="users1"
              style={{ display: 'grid', gap: '10px' }}
              loading={() => (
                <div style={{ 'text-align': 'center', padding: '20px', color: '#3b82f6' }}>Loading more users1...</div>
              )}
            >
              <For each={props.users1.data}>{(user) => <UserCard user={user} />}</For>
            </InfiniteScroll>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <h2>Users2 Container</h2>
          <div
            data-testid="scroll-container-2"
            style={{
              height: '400px',
              width: '100%',
              border: '2px solid #ef4444',
              'overflow-y': 'auto',
              background: '#fef2f2',
              padding: '10px',
            }}
          >
            {/* @ts-expect-error The adapter's reactive accessor return type is not JSX-typed. */}
            <InfiniteScroll
              data="users2"
              style={{ display: 'grid', gap: '10px' }}
              loading={() => (
                <div style={{ 'text-align': 'center', padding: '20px', color: '#ef4444' }}>Loading more users2...</div>
              )}
            >
              <For each={props.users2.data}>{(user) => <UserCard user={user} />}</For>
            </InfiniteScroll>
          </div>
        </div>
      </div>
      <p style={{ 'margin-top': '20px' }}>Content below the scroll containers to verify page doesn't scroll.</p>
    </div>
  )
}
