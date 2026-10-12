import { Deferred, Link, usePage } from 'inertia-adapter-solid'
export default function PageA(props: { bar: string }) {
  const page = usePage<{ foo?: string }>()
  return (
    <>
      <Deferred data="foo" fallback={<div id="foo-loading">Loading foo...</div>}>
        <p id="foo">Foo: {page.props.foo}</p>
      </Deferred>
      <p id="bar">Bar: {props.bar}</p>
      <Link href="/once-props/slow-deferred/b">Go to Page B</Link>
    </>
  )
}
