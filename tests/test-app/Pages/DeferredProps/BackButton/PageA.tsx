import { Deferred, Link, usePage } from 'inertia-adapter-solid'
export default function PageA() {
  const page = usePage<{ fastProp?: string; slowProp?: string }>()
  return (
    <>
      <Deferred data="fastProp" fallback={<div>Loading fast prop...</div>}>
        {page.props.fastProp}
      </Deferred>
      <Deferred data="slowProp" fallback={<div>Loading slow prop...</div>}>
        {page.props.slowProp}
      </Deferred>
      <Link href="/deferred-props/back-button/b">Go to Page B</Link>
    </>
  )
}
