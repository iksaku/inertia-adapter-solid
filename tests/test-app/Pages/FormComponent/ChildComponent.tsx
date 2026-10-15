import { createSignal, createMemo } from 'solid-js'
import { Form } from 'inertia-adapter-solid'
const ChildElement = (props1: {
  name: string
}) => {
  const [internalState, setInternalState] = createSignal('')
  const transformedState = createMemo(() => internalState()!.toUpperCase())
  return (
    <div>
      <label for={props1.name}>Child Input</label>
      <input
        id={props1.name}
        name={props1.name}
        value={transformedState()}
        onInput={(e) => setInternalState(e.currentTarget.value)}
      />
    </div>
  )
}
export default () => {
  return (
    <Form action="/dump/post" method="post">
      {(props2) => (
        <>
          <h1>Form Elements</h1>

          <div>
            Form is <span>{props2.isDirty ? 'dirty' : 'clean'}</span>
          </div>

          <ChildElement name="child" />

          <button type="submit">Submit</button>
        </>
      )}
    </Form>
  )
}
