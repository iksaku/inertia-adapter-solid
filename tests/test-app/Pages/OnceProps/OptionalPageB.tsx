import { Link, router } from 'inertia-adapter-solid'
export default function PageB(props: { foo?: string; bar: string }) {
  return (
    <>
      <p id="foo">Foo: {props.foo ?? 'not loaded'}</p>
      <p id="bar">Bar: {props.bar}</p>
      <Link href="/once-props/optional/a">Go to Optional Page A</Link>
      <button onClick={() => router.reload({ only: ['foo'] })}>Load foo</button>
    </>
  )
}
