import { createSignal } from 'solid-js'
import { Form } from 'inertia-adapter-solid'
export default function UnmountRace() {
  const [show, setShow] = createSignal(true)
  return (
    <div>
      <h1>Form Unmount Race</h1>

      {show() && (
        <Form action="/dump/post" method="post">
          <input type="text" name="name" id="name" value="John" />
        </Form>
      )}

      <button id="hide" onClick={() => setShow(false)}>
        Hide Form
      </button>
    </div>
  )
}
