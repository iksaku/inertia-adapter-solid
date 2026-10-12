import { WhenVisible, usePage } from 'inertia-adapter-solid'
const Visitors = () => {
  const reactiveProps0Page = usePage<{
      stats?: {
        visitors: number
      }
    }>(),
    reactiveProps0 = () => reactiveProps0Page.props
  return <p id="visitors">Visitors: {reactiveProps0().stats?.visitors}</p>
}
export default () => {
  return (
    <div style={{ 'margin-top': '2000px', padding: '20px' }}>
      <WhenVisible data="stats.visitors" fallback={<p id="loading">Loading visitors...</p>}>
        <Visitors />
      </WhenVisible>
    </div>
  )
}
