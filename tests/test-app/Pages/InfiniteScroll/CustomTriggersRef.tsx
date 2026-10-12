import { InfiniteScroll } from 'inertia-adapter-solid'
import { For, Show } from 'solid-js'
import type { User } from './UserCard'
export default function CustomTriggersRef(props: { users: { data: User[] }; heading?: string }) {
  let tableHeader: HTMLTableSectionElement | undefined
  let tableFooter: HTMLTableSectionElement | undefined
  let tableBody: HTMLTableSectionElement | undefined
  const Spacer = () => (
    <div
      style={{
        height: '300px',
        width: '100%',
        'text-align': 'center',
        'line-height': '300px',
        border: '1px solid #ccc',
      }}
    >
      Spacer
    </div>
  )
  return (
    <div style={{ padding: '20px' }}>
      <h1>{props.heading || 'Custom Triggers with Refs Test'}</h1>
      {/* @ts-expect-error The adapter's reactive accessor return type is not JSX-typed. */}
      <InfiniteScroll
        data="users"
        startElement={() => tableHeader}
        endElement={() => tableFooter}
        itemsElement={() => tableBody}
      >
        {(slot) => (
          <>
            <Spacer />
            <table style={{ width: '100%', 'border-collapse': 'collapse' }}>
              <thead
                ref={(el) => {
                  tableHeader = el
                }}
                style={{ padding: '10px' }}
              >
                <tr>
                  <th style={{ padding: '12px', border: '1px solid #ccc' }}>ID</th>
                  <th style={{ padding: '12px', border: '1px solid #ccc' }}>Name</th>
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
                      <td style={{ padding: '80px 12px', border: '1px solid #ccc' }}>{user.id}</td>
                      <td style={{ padding: '80px 12px', border: '1px solid #ccc' }}>{user.name}</td>
                    </tr>
                  )}
                </For>
                <Show when={slot.loadingPrevious || slot.loadingNext}>
                  <tr>
                    <td colSpan={2} style={{ padding: '12px', border: '1px solid #ccc', 'text-align': 'center' }}>
                      Loading...
                    </td>
                  </tr>
                </Show>
              </tbody>
              <tfoot
                ref={(el) => {
                  tableFooter = el
                }}
                style={{ background: '#fdf2e8', padding: '10px' }}
              >
                <tr>
                  <td colSpan={2} style={{ padding: '12px', border: '1px solid #ccc', 'text-align': 'center' }}>
                    Table Footer - Triggers when this comes into view
                  </td>
                </tr>
              </tfoot>
            </table>
            <Spacer />
          </>
        )}
      </InfiniteScroll>
    </div>
  )
}
