import { Deferred, Link, usePage } from 'inertia-adapter-solid'
export default function PageB() {
  const page = usePage<{ data?: string }>()
  return (
    <>
      <Deferred data="data" fallback={<div>Loading data...</div>}>
        {page.props.data}
      </Deferred>
      <Link href="/deferred-props/back-button/a">Go to Page A</Link>
    </>
  )
}
