import { Deferred, Link, usePage } from 'inertia-adapter-solid'
export default function PageB(props: { bar: string }) {
  const page = usePage<{ foo?: { text: string } }>()
  return (
    <>
      <Deferred data="foo" fallback={<div>Loading foo...</div>}>
        <p id="foo">Foo: {page.props.foo?.text}</p>
      </Deferred>
      <p id="bar">Bar: {props.bar}</p>
      <Link href="/once-props/deferred/a">Go to Deferred Page A</Link>
    </>
  )
}
