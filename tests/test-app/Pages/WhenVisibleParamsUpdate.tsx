import { WhenVisible } from 'inertia-adapter-solid'
import { createSignal } from 'solid-js'

export default function Visible(props: { lazyData?: { text: string } }) {
  const [paramValue, setParamValue] = createSignal('initial')
  return (
    <div>
      <button onClick={() => setParamValue('updated')}>Update Param</button>
      <p>Current param: {paramValue()}</p>
      <div style={{ 'margin-top': '3000px' }}>
        <WhenVisible
          data="lazyData"
          params={{ data: { paramValue: paramValue() } }}
          always
          fallback={<p>Loading lazy data...</p>}
        >
          <div>
            <p>Data loaded: {props.lazyData?.text}</p>
          </div>
        </WhenVisible>
      </div>
    </div>
  )
}
