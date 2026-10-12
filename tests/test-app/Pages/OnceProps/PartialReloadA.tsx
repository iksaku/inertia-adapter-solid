import { Link, router } from 'inertia-adapter-solid'
export default function PageA(props: { foo: string; bar: string }) {
  return (
    <>
      <p id="foo">Foo: {props.foo}</p>
      <p id="bar">Bar: {props.bar}</p>
      <Link href="/once-props/partial-reload/b">Go to Partial Reload B</Link>
      <button onClick={() => router.reload({ only: ['foo'] })}>Reload (only foo)</button>
    </>
  )
}
