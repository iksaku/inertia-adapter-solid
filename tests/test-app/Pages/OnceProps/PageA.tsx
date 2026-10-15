import { Link, router } from 'inertia-adapter-solid'
export default function PageA(props: { foo: string; bar: string }) {
  return (
    <>
      <p id="foo">Foo: {props.foo}</p>
      <p id="bar">Bar: {props.bar}</p>
      <Link href="/once-props/page-b">Go to Page B</Link>
      <Link href="/once-props/page-c">Go to Page C</Link>
      <Link href="/once-props/page-d" prefetch="mount">
        Go to Page D
      </Link>
      <Link href="/once-props/page-e" prefetch="mount" cacheFor={1000}>
        Go to Page E (short cache)
      </Link>
      <button onClick={() => router.reload({ only: ['foo'] })}>Reload (only foo)</button>
      <button onClick={() => router.replaceProp('foo', 'replaced-foo')}>Replace foo</button>
    </>
  )
}
