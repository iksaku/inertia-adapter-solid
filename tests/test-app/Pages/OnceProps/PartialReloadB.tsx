import { Link } from 'inertia-adapter-solid'
export default function PageB(props: { foo: string; bar: string }) {
  return (
    <>
      <p id="foo">Foo: {props.foo}</p>
      <p id="bar">Bar: {props.bar}</p>
      <Link href="/once-props/partial-reload/a">Go to Partial Reload A</Link>
    </>
  )
}
