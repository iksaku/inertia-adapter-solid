import { createSignal } from 'solid-js'
import { Form } from 'inertia-adapter-solid'
export default () => {
  const [errorBag, setErrorBag] = createSignal<string | null>(null)
  return (
    <Form
      action={errorBag() ? '/form-component/errors/bag' : '/form-component/errors'}
      method="post"
      errorBag={errorBag()}
    >
      {(props1) => (
        <>
          <h1>Form Errors</h1>

          {props1.hasErrors ? <div>Form has errors</div> : <div>No errors</div>}

          <div>
            <label for="name">Name</label>
            <input type="text" name="name" id="name" />
            <div id="error_name">{props1.errors!.name}</div>
          </div>

          <div>
            <label for="handle">Handle</label>
            <input type="text" name="handle" id="handle" />
            <div id="error_handle">{props1.errors!.handle}</div>
          </div>

          <div>
            <button
              type="button"
              onClick={() =>
                props1.setError({
                  name: 'The name field is required.',
                  handle: 'The handle field is invalid.',
                })
              }
            >
              Set Errors
            </button>
            <button type="button" onClick={() => props1.clearErrors()}>
              Clear Errors
            </button>
            <button type="button" onClick={() => props1.clearErrors('name')}>
              Clear Name Error
            </button>
            <button type="button" onClick={() => setErrorBag('bag')}>
              Use Error Bag
            </button>
          </div>

          <button type="submit">Submit</button>
        </>
      )}
    </Form>
  )
}
