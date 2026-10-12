import { Deferred, router, usePage } from 'inertia-adapter-solid'
export default function WithRescuedErrors() {
  const page = usePage<{ foo?: { text: string } | null }>()
  // Solid Deferred has no rescue prop. Do not implement rescue behavior in this fixture.
  return (
    <>
      <Deferred data="foo" fallback={<div>Loading foo...</div>}>
        <div id="foo">{page.props.foo?.text}</div>
      </Deferred>
      <button type="button" onClick={() => router.reload({ only: ['foo'], headers: { 'X-Test-Retry': 'true' } })}>
        Retry
      </button>
    </>
  )
}
