import { Deferred, usePage } from 'inertia-adapter-solid'
export default function PageB(props: { bar?: string }) {
  const page = usePage<{ foo?: string }>()
  return (
    <>
      <Deferred data="foo" fallback={<div>Loading foo...</div>}>
        <p id="foo">Foo: {page.props.foo}</p>
      </Deferred>
      <p id="bar">Bar: {props.bar}</p>
    </>
  )
}
