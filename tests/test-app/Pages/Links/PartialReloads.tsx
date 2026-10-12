import { createEffect, mergeProps } from 'solid-js'
import { Link } from 'inertia-adapter-solid'
export default (props0Input: {
  foo?: number
  bar: number
  baz: number
  headers: Record<string, string>
}) => {
  const props0 = mergeProps({ foo: 0 }, props0Input)
  createEffect(
    () => (window._inertia_props = { foo: props0.foo, bar: props0.bar, baz: props0.baz, headers: props0.headers }),
  )
  return (
    <div>
      <span class="text">This is the links page that demonstrates partial reloads</span>
      <span class="foo-text">Foo is now {props0.foo}</span>
      <span class="bar-text">Bar is now {props0.bar}</span>
      <span class="baz-text">Baz is now {props0.baz}</span>
      <pre class="headers">{JSON.stringify(props0.headers, null, 2)}</pre>

      <Link href="/links/partial-reloads" data={{ foo: props0.foo }} class="all">
        Update All
      </Link>
      <Link href="/links/partial-reloads" only={['headers', 'foo', 'bar']} data={{ foo: props0.foo }} class="foo-bar">
        Only foo + bar
      </Link>
      <Link href="/links/partial-reloads" only={['headers', 'baz']} data={{ foo: props0.foo }} class="baz">
        Only baz
      </Link>
      <Link href="/links/partial-reloads" except={['foo', 'bar']} data={{ foo: props0.foo }} class="except-foo-bar">
        Except foo + bar
      </Link>
      <Link href="/links/partial-reloads" except={['baz']} data={{ foo: props0.foo }} class="except-baz">
        Except baz
      </Link>
    </div>
  )
}
