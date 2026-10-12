import { Link, router } from 'inertia-adapter-solid'
export default function PageA(props: { foo: string; bar: string }) {
  return (
    <>
      <p id="foo">Foo: {props.foo}</p>
      <p id="bar">Bar: {props.bar}</p>
      <Link href="/once-props/ttl/b">Go to TTL Page B</Link>
      <Link href="/once-props/ttl/c" prefetch="mount">
        Go to TTL Page C
      </Link>
      <button onClick={() => router.reload({ only: ['foo'] })}>Reload foo</button>
    </>
  )
}
