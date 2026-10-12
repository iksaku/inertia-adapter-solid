import { InfiniteScroll } from 'inertia-adapter-solid'
import { For } from 'solid-js'
import type { User } from './UserCard'
export default function ShortContent(props: { users: { data: User[] } }) {
  let tableBody: HTMLTableSectionElement | undefined
  return (
    // @ts-expect-error The adapter's reactive accessor return type is not JSX-typed.
    <InfiniteScroll data="users" itemsElement={() => tableBody}>
      {() => (
        <table style={{ width: '100%', 'border-collapse': 'collapse' }}>
          <tbody
            ref={(el) => {
              tableBody = el
            }}
          >
            <For each={props.users.data}>
              {(user) => (
                <tr data-user-id={user.id}>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>{user.id}</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>{user.name}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      )}
    </InfiniteScroll>
  )
}
