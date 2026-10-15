import { router, WhenVisible } from 'inertia-adapter-solid'

export default function Visible(props: { firstData?: { text: string }; secondData?: { text: string } }) {
  return (
    <div>
      <h1>WhenVisible + Array Props + Reload</h1>
      <button onClick={() => router.reload()}>Reload Page</button>
      <div style={{ 'margin-top': '2000px', padding: '20px', border: '1px solid #ccc' }}>
        <WhenVisible data={['firstData', 'secondData']} fallback={<p>Loading array data...</p>}>
          <div>
            <p>{props.firstData?.text}</p>
            <p>{props.secondData?.text}</p>
          </div>
        </WhenVisible>
      </div>
    </div>
  )
}
