import { router, WhenVisible } from 'inertia-adapter-solid'

export default function Visible(props: { lazyData?: { text: string } }) {
  return (
    <div>
      <h1>WhenVisible + Reload</h1>
      <button onClick={() => router.reload()}>Reload Page</button>
      <div style={{ 'margin-top': '2000px', padding: '20px', border: '1px solid #ccc' }}>
        <WhenVisible data="lazyData" fallback={<p>Loading lazy data...</p>}>
          {props.lazyData?.text}
        </WhenVisible>
      </div>
    </div>
  )
}
