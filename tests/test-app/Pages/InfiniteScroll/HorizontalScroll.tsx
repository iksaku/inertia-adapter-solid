import { InfiniteScroll } from 'inertia-adapter-solid'
import { For } from 'solid-js'
import type { User } from './UserCard'
export default function Horizontal(props: { users: { data: User[] } }) {
  return (
    <div style={{ height: '120px', 'overflow-x': 'scroll', display: 'flex', width: '100vw' }}>
      <InfiniteScroll
        data="users"
        style={{ display: 'flex', gap: '20px', height: '120px' }}
        loading={() => (
          <div
            style={{
              'min-width': '150px',
              height: '100px',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              border: '1px dashed #ccc',
              'margin-left': '20px',
              'margin-right': '20px',
            }}
          >
            Loading...
          </div>
        )}
      >
        <For each={props.users.data}>
          {(user) => (
            <div
              data-user-id={user.id}
              style={{
                'min-width': '200px',
                height: '100px',
                border: '1px solid #ccc',
                'background-color': '#f5f5f5',
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                flex: 'none',
              }}
            >
              {user.name}
            </div>
          )}
        </For>
      </InfiniteScroll>
    </div>
  )
}
