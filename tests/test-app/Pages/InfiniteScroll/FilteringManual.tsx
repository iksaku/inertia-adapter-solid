import { useForm } from 'inertia-adapter-solid'
import { debounce } from 'es-toolkit'
import { createEffect, onCleanup } from 'solid-js'
import Manual from './Manual'
import type { User } from './UserCard'
export default function FilteringManual(props: { users: { data: User[] }; search?: string }) {
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
      <Manual users={props.users} />
    </div>
  )
}
