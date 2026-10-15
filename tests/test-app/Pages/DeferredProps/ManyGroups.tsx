import { Deferred, Link, usePage } from 'inertia-adapter-solid'

export default function ManyGroups() {
  const page = usePage<{
    foo?: { text: string }
    bar?: { text: string }
    baz?: { text: string }
    qux?: { text: string }
    quux?: { text: string }
  }>()
  return (
    <>
      <Deferred data="foo" fallback={<div>Loading foo...</div>}>
        {page.props.foo?.text}
      </Deferred>
      <Deferred data="bar" fallback={<div>Loading bar...</div>}>
        {page.props.bar?.text}
      </Deferred>
      <Deferred data="baz" fallback={<div>Loading baz...</div>}>
        {page.props.baz?.text}
      </Deferred>
      <Deferred data="qux" fallback={<div>Loading qux...</div>}>
        {page.props.qux?.text}
      </Deferred>
      <Deferred data="quux" fallback={<div>Loading quux...</div>}>
        {page.props.quux?.text}
      </Deferred>
      <Link href="/deferred-props/page-1">Page 1</Link>
      <Link href="/deferred-props/page-2">Page 2</Link>
      <Link href="/deferred-props/many-groups">Many groups</Link>
    </>
  )
}
