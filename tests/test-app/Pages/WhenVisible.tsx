import { WhenVisible } from 'inertia-adapter-solid'
import { createSignal } from 'solid-js'

export default function Visible() {
  const [count, setCount] = createSignal(0)
  return (
    <>
      <div style={{ 'margin-top': '5000px' }}>
        <WhenVisible data="foo" fallback={<div>Loading first one...</div>}>
          <div>First one is visible!</div>
        </WhenVisible>
      </div>
      <div style={{ 'margin-top': '5000px' }}>
        <WhenVisible buffer={1000} data="foo" fallback={<div>Loading second one...</div>}>
          <div>Second one is visible!</div>
        </WhenVisible>
      </div>
      <div style={{ 'margin-top': '5000px' }}>
        <WhenVisible data="foo" fallback={<div>Loading third one...</div>} always>
          <div>Third one is visible!</div>
        </WhenVisible>
      </div>
      <div style={{ 'margin-top': '5000px' }}>
        <WhenVisible data="foo" fallback={<div>Loading fourth one...</div>} />
      </div>
      <div style={{ 'margin-top': '6000px' }}>
        <WhenVisible
          fallback={<div>Loading fifth one...</div>}
          always
          params={{
            data: { count: count() },
            onSuccess: () => {
              setCount((c) => c + 1)
            },
          }}
        >
          <div>Count is now {count()}</div>
        </WhenVisible>
      </div>
    </>
  )
}
