import { InfiniteScroll, Link, useForm } from 'inertia-adapter-solid'
import { debounce } from 'es-toolkit'
import { For, createEffect, onCleanup } from 'solid-js'
import UserCard, { type User } from './UserCard'
export default function Filtering(props: {
  users: { data: User[] }
  preserveState: boolean
  filter?: string
  search?: string
}) {
  const form = useForm({ filter: undefined, page: undefined, search: props.search })
  const debouncedSearch = debounce(
    () =>
      form.get(
        '',
        props.preserveState
          ? { preserveState: true, replace: true, only: ['users', 'search', 'filter'], reset: ['users'] }
          : { replace: true },
      ),
    250,
  )
  createEffect(() => {
    if (form.data.search !== props.search) debouncedSearch()
  })
  onCleanup(() => debouncedSearch.cancel())
  return (
    <div>
      <div style={{ 'margin-bottom': '20px', display: 'flex', gap: '10px' }}>
        <Link href="">No Filter</Link>
        <Link href="?filter=a-m">A-M</Link>
        <Link href="?filter=n-z">N-Z</Link>
        <div>Current filter: {props.filter || 'none'}</div>
        <div>Current search: {props.search || 'none'}</div>
        <input
          value={form.data.search || ''}
          onInput={(e) => form.setData('search', e.currentTarget.value)}
          placeholder="Search..."
        />
      </div>
      {/* @ts-expect-error The adapter's reactive accessor return type is not JSX-typed. */}
      <InfiniteScroll
        data="users"
        style={{ display: 'grid', gap: '20px' }}
        loading={() => <div style={{ 'text-align': 'center', padding: '20px' }}>Loading...</div>}
      >
        <For each={props.users.data}>{(user) => <UserCard user={user} />}</For>
      </InfiniteScroll>
      <div style={{ 'margin-top': '20px', display: 'flex', gap: '10px' }}>
        <Link href="">No Filter</Link>
        <Link href="?filter=a-m">A-M</Link>
        <Link href="?filter=n-z">N-Z</Link>
        <div>Current filter: {props.filter || 'none'}</div>
        <div>Current search: {props.search || 'none'}</div>
        <input
          value={form.data.search || ''}
          onInput={(e) => form.setData('search', e.currentTarget.value)}
          placeholder="Search..."
        />
      </div>
    </div>
  )
}
