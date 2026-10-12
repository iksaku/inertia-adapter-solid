import { Deferred, router, usePage } from 'inertia-adapter-solid'

export default function PartialReloads() {
  const page = usePage<{ foo?: { timestamp: string }; bar?: { timestamp: string } }>()
  return (
    <>
      <Deferred data="foo" fallback={<div>Loading foo...</div>}>
        <div id="foo-timestamp">{page.props.foo?.timestamp}</div>
      </Deferred>
      <Deferred data="bar" fallback={<div>Loading bar...</div>}>
        <div id="bar-timestamp">{page.props.bar?.timestamp}</div>
      </Deferred>
      <button onClick={() => router.reload({ only: ['foo'] })}>Reload foo only</button>
      <button onClick={() => router.reload({ only: ['bar'] })}>Reload bar only</button>
      <button onClick={() => router.reload({ only: ['foo', 'bar'] })}>Reload both</button>
    </>
  )
}
