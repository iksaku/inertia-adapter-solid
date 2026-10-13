import { InfiniteScroll } from 'inertia-adapter-solid'
import { For, Show } from 'solid-js'
import type { User } from './UserCard'
export default function DataTable(props: { users: { data: User[] } }) {
  let tableBody: HTMLTableSectionElement | undefined
  return (
    <InfiniteScroll data="users" itemsElement={() => tableBody}>
      {(slot) => (
        <table style={{ width: '100%', 'border-collapse': 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '8px', border: '1px solid #ccc' }}>ID</th>
              <th style={{ padding: '8px', border: '1px solid #ccc' }}>Name</th>
            </tr>
          </thead>
          <tbody
            ref={(el) => {
              tableBody = el
            }}
          >
            <For each={props.users.data}>
              {(user) => (
                <tr data-user-id={user.id}>
                  <td style={{ padding: '8px', border: '1px solid #ccc' }}>{user.id}</td>
                  <td style={{ padding: '8px', border: '1px solid #ccc' }}>{user.name}</td>
                </tr>
              )}
            </For>
          </tbody>
          <tfoot>
            <Show when={slot.loadingPrevious || slot.loadingNext}>
              <tr>
                <td colSpan={2} style={{ padding: '8px', border: '1px solid #ccc', 'text-align': 'center' }}>
                  Loading...
                </td>
              </tr>
            </Show>
          </tfoot>
        </table>
      )}
    </InfiniteScroll>
  )
}
