import { Deferred, Link, usePage } from 'inertia-adapter-solid'

export default function Page2() {
  const page = usePage<{ baz?: string; qux?: string }>()
  return (
    <>
      <Deferred data="baz" fallback={<div>Loading baz...</div>}>
        {page.props.baz}
      </Deferred>
      <Deferred data="qux" fallback={<div>Loading qux...</div>}>
        {page.props.qux}
      </Deferred>
      <Deferred
        data={['baz', 'qux']}
        fallback={<div>Loading baz and qux...</div>}
      >{`both ${page.props.baz} and ${page.props.qux}`}</Deferred>
      <Link href="/deferred-props/page-2">Page 2</Link>
    </>
  )
}
