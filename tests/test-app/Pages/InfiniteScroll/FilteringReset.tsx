import { InfiniteScroll, useForm } from 'inertia-adapter-solid'
import { debounce } from 'es-toolkit'
import { For, createEffect, onCleanup } from 'solid-js'
import UserCard, { type User } from './UserCard'
export default function FilteringReset(props: { users: { data: User[] }; search?: string }) {
  const form = useForm({ search: props.search })
  const debouncedSearch = debounce(
    () => form.get('', { preserveState: true, replace: true, only: ['users', 'search'], reset: ['users'] }),
    250,
  )
  createEffect(() => {
    if (form.data.search !== props.search) debouncedSearch()
  })
  onCleanup(() => debouncedSearch.cancel())
  return (
    <div>
      <div style={{ 'margin-bottom': '20px', display: 'flex', gap: '10px' }}>
        <div>Current search: {props.search || 'none'}</div>
        <input
          value={form.data.search || ''}
          onInput={(e) => form.setData('search', e.currentTarget.value)}
          placeholder="Search..."
        />
      </div>
      <InfiniteScroll
        data="users"
        buffer={2000}
        style={{ display: 'grid', gap: '20px' }}
        loading={() => <div style={{ 'text-align': 'center', padding: '20px' }}>Loading...</div>}
      >
        <For each={props.users.data}>{(user) => <UserCard user={user} />}</For>
      </InfiniteScroll>
    </div>
  )
}
