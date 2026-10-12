import { Deferred, Link, router, usePage } from 'inertia-adapter-solid'
export default function RapidNavigation() {
  const page = usePage<{
    id: string
    users?: { text: string }
    stats?: { text: string }
    activity?: { text: string }
  }>()
  return (
    <>
      <div>Page: {page.props.id}</div>
      <Deferred data="users" fallback={<div>Loading users...</div>}>
        <div>{page.props.users?.text}</div>
      </Deferred>
      <Deferred data="stats" fallback={<div>Loading stats...</div>}>
        <div>{page.props.stats?.text}</div>
      </Deferred>
      <Deferred data="activity" fallback={<div>Loading activity...</div>}>
        <div>{page.props.activity?.text}</div>
      </Deferred>
      <Link href="/deferred-props/rapid-navigation/a">Page A</Link>
      <Link href="/deferred-props/rapid-navigation/b">Page B</Link>
      <Link href="/deferred-props/rapid-navigation/c">Page C</Link>
      <Link href="/deferred-props/page-1">Navigate Away</Link>
      <button
        onClick={() => {
          if (confirm('Navigate away?')) router.visit('/deferred-props/page-2')
        }}
      >
        Navigate with onBefore
      </button>
      <button onClick={() => router.reload()}>Plain reload</button>
      <button onClick={() => router.visit(`/deferred-props/rapid-navigation/${page.props.id}?foo=bar`)}>
        Add query param
      </button>
      <button onClick={() => router.prefetch('/deferred-props/page-1')}>Prefetch Page 1</button>
    </>
  )
}
