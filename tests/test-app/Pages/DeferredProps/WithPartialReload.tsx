import { Deferred, Link, router, usePage } from 'inertia-adapter-solid'
import { For } from 'solid-js'
const DeferredUsers = () => {
  const page = usePage<{ users?: Array<{ id: number; name: string }> }>()
  return (
    <div>
      <For each={page.props.users}>{(user) => <span>{user.name}</span>}</For>
    </div>
  )
}
export default function WithPartialReload(props: { withOnly?: string[]; withExcept?: string[] }) {
  // Solid Deferred does not expose a reloading slot; ordinary deferred content remains covered.
  return (
    <div>
      <Deferred data="users" fallback={<span>Loading...</span>}>
        <DeferredUsers />
      </Deferred>
      <button onClick={() => router.reload({ only: props.withOnly, except: props.withExcept })}>
        Trigger a partial reload
      </button>
      <Link href="/deferred-props/page-1" prefetch="hover">
        Prefetch
      </Link>
    </div>
  )
}
