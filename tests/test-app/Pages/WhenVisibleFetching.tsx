import { WhenVisible } from 'inertia-adapter-solid'
export default function WhenVisibleFetching() {
  // Solid WhenVisible does not expose a fetching slot. Keep the supported loaded/fallback contract.
  return (
    <div style={{ 'margin-top': '5000px' }}>
      <WhenVisible data="lazyData" always fallback={<div>Loading lazy data...</div>}>
        <div>Lazy data loaded!</div>
      </WhenVisible>
    </div>
  )
}
