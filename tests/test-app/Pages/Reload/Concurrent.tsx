import { router, usePage } from 'inertia-adapter-solid'
export default () => {
  const reactiveProps0Page = usePage<{
      foo?: string
      bar?: string
    }>(),
    reactiveProps0 = () => reactiveProps0Page.props
  function reloadBothProps() {
    router.reload({ only: ['foo'] })
    setTimeout(() => router.reload({ only: ['bar'] }), 50)
  }
  return (
    <div>
      <div id="foo">Foo: {reactiveProps0().foo}</div>
      <div id="bar">Bar: {reactiveProps0().bar}</div>

      <button onClick={reloadBothProps}>Reload both props</button>
    </div>
  )
}
