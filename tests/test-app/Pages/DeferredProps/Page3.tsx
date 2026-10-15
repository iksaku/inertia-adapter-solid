import { Deferred, usePage } from 'inertia-adapter-solid'

export default function Page3() {
  const page = usePage<{ alpha?: string; beta?: string }>()
  return (
    <>
      <Deferred data="alpha" fallback={<div>Loading alpha...</div>}>
        {page.props.alpha}
      </Deferred>
      <Deferred data="beta" fallback={<div>Loading beta...</div>}>
        {page.props.beta}
      </Deferred>
    </>
  )
}
