import { Deferred, Link, usePage } from 'inertia-adapter-solid'

const Foo = () => {
  const page = usePage<{ foo?: { text: string } }>()
  return <>{page.props.foo?.text}</>
}
const Bar = () => {
  const page = usePage<{ bar?: { text: string } }>()
  return <>{page.props.bar?.text}</>
}
export default function Page1() {
  return (
    <>
      <Deferred data="foo" fallback={<div>Loading foo...</div>}>
        <Foo />
      </Deferred>
      <Deferred data="bar" fallback={<div>Loading bar...</div>}>
        <Bar />
      </Deferred>
      <Link href="/deferred-props/page-1">Page 1</Link>
      <Link href="/deferred-props/page-2">Page 2</Link>
      <Link href="/deferred-props/page-3" prefetch>
        Page 3
      </Link>
    </>
  )
}
