import { Link, WhenVisible } from 'inertia-adapter-solid'

export default function Visible(props: { lazyData?: { text: string } }) {
  return (
    <div>
      <h1>WhenVisible + Back Button</h1>
      <Link href="/links/method">Navigate Away</Link>
      <div style={{ 'margin-top': '2000px', padding: '20px', border: '1px solid #ccc' }}>
        <WhenVisible data="lazyData" fallback={<p>Loading lazy data...</p>}>
          <p>{props.lazyData?.text}</p>
        </WhenVisible>
      </div>
      <div style={{ 'margin-top': '2000px', padding: '20px', border: '1px solid #ccc' }}>
        <WhenVisible data="lazyData" always fallback={<p>Loading always data...</p>}>
          <p>Always: {props.lazyData?.text}</p>
        </WhenVisible>
      </div>
    </div>
  )
}
