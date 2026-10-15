import { Deferred, Link, usePage } from 'inertia-adapter-solid'
export default function PageA(props: { bar: string }) {
  const page = usePage<{ foo?: { text: string } }>()
  return (
    <>
      <Deferred data="foo" fallback={<div>Loading foo...</div>}>
        <p id="foo">Foo: {page.props.foo?.text}</p>
      </Deferred>
      <p id="bar">Bar: {props.bar}</p>
      <Link href="/once-props/deferred/b">Go to Deferred Page B</Link>
      <Link href="/once-props/deferred/c" prefetch="mount">
        Go to Deferred Page C
      </Link>
    </>
  )
}
