import { router, usePage } from 'inertia-adapter-solid'
export default () => {
  const reactiveProps0Page = usePage<{
      foo?: string
      bar?: string
      timeframe?: string
    }>(),
    reactiveProps0 = () => reactiveProps0Page.props
  function reloadBothPropsWithData() {
    router.reload({ only: ['foo'], data: { timeframe: 'week' } })
    setTimeout(() => router.reload({ only: ['bar'], data: { timeframe: 'week' } }), 50)
  }
  return (
    <div>
      <div id="foo">Foo: {reactiveProps0().foo}</div>
      <div id="bar">Bar: {reactiveProps0().bar}</div>
      <div id="timeframe">Timeframe: {reactiveProps0().timeframe}</div>

      <button onClick={reloadBothPropsWithData}>Reload both props with data</button>
    </div>
  )
}
