import { Index } from 'solid-js'
import { InertiaFormProps, useForm } from 'inertia-adapter-solid'
const MemoizedDisplay = (props1: {
  form: InertiaFormProps<{
    position: string
  }>
}) => {
  return <div id="memo-value">Memo value: {props1.form!.data.position}</div>
}
export default () => {
  const form = useForm({ position: 'initial' })
  let renderCount = 0
  renderCount++
  const options = ['initial', 'goalkeeper', 'defender', 'midfielder', 'forward']
  return (
    <div>
      <h1>setData Re-render Test</h1>
      <div id="render-count">Render count: {renderCount}</div>
      <div id="current-value">Current value: {form.data.position}</div>

      <MemoizedDisplay form={form} />

      {
        <Index each={options}>
          {(option) => <button onClick={() => form.setData('position', option())}>Set {option()}</button>}
        </Index>
      }
    </div>
  )
}
