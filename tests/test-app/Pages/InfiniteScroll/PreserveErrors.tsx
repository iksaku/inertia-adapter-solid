import { InfiniteScroll, useForm, usePage } from 'inertia-adapter-solid'
import { For, Show } from 'solid-js'
import UserCard, { type User } from './UserCard'
export default function PreserveErrors(props: { users: { data: User[] } }) {
  const page = usePage<{ errors: { name?: string } }>()
  const form = useForm({ name: '' })
  return (
    <>
      <Show when={page.props.errors?.name}>
        <p id="page-error">{page.props.errors?.name}</p>
      </Show>
      <Show when={form.errors.name}>
        <p id="form-error">{form.errors.name}</p>
      </Show>
      <button type="button" onClick={() => form.post('/infinite-scroll/preserve-errors')}>
        Submit
      </button>
      <InfiniteScroll
        data="users"
        style={{ display: 'grid', gap: '20px' }}
        manual
        previous={(slot) => (
          <Show when={slot.hasMore}>
            <button id="load-previous" onClick={slot.fetch}>
              {slot.loading ? 'Loading previous items...' : 'Load previous items'}
            </button>
          </Show>
        )}
        next={(slot) => (
          <Show when={slot.hasMore}>
            <button id="load-next" onClick={slot.fetch}>
              {slot.loading ? 'Loading next items...' : 'Load next items'}
            </button>
          </Show>
        )}
      >
        <For each={props.users.data}>{(user) => <UserCard user={user} />}</For>
      </InfiniteScroll>
    </>
  )
}
