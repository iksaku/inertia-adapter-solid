import { WhenVisible } from 'inertia-adapter-solid'

export default function Visible(props: {
  dataOnlyProp?: { text: string }
  mergedProp?: { text: string }
  mergedWithCallbackProp?: { text: string }
}) {
  return (
    <>
      <div id="data-only" style={{ 'margin-top': '3000px' }}>
        <WhenVisible data="dataOnlyProp" fallback={<div>Loading data only...</div>}>
          <div>Data only loaded: {props.dataOnlyProp?.text}</div>
        </WhenVisible>
      </div>
      <div id="merged" style={{ 'margin-top': '5000px' }}>
        <WhenVisible
          data="mergedProp"
          params={{ data: { extra: 'from-params' } }}
          fallback={<div>Loading merged...</div>}
        >
          <div>Merged loaded: {props.mergedProp?.text}</div>
        </WhenVisible>
      </div>
      <div id="merged-with-callback" style={{ 'margin-top': '5000px' }}>
        <WhenVisible
          data="mergedWithCallbackProp"
          params={{ data: { page: '2' }, preserveUrl: true }}
          fallback={<div>Loading merged with callback...</div>}
        >
          <div>Merged with callback loaded: {props.mergedWithCallbackProp?.text}</div>
        </WhenVisible>
      </div>
    </>
  )
}
