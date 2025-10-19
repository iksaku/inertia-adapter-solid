import MainLayout from '@/Components/MainLayout'
import { useForm } from 'inertia-adapter-solid'
import { For, createSignal } from 'solid-js'

export default function UseForm() {
  const form = useForm({ message: 'Hello world!', test: 'Meh!' })

  const [errorKey, setErrorKey] = createSignal('')
  const [errorMessage, setErrorMessage] = createSignal('')

  return (
    <>
      <section>
        <h3>Form Data</h3>
        <ul>
          <For each={Object.keys(form.data)}>
            {(key) => (
              <li>
                <div>Property: {key}</div>
                <div>Value: {form.data[key]}</div>
                <div>
                  Edit: <input type="text" value={form.data[key]} onInput={(e) => form.setData(key, e.target.value)} />
                </div>
              </li>
            )}
          </For>
        </ul>

        <div>
          <button type="button" onClick={() => form.reset()}>
            Reset
          </button>

          <button type="button" onClick={() => form.reset('message')}>
            Reset Message
          </button>
        </div>

        <div>
          <button type="button" onClick={() => form.defaults()}>
            Update Defaults
          </button>
        </div>
      </section>

      <section>
        <h3>Error Messages</h3>
        <ul>
          <For each={Object.keys(form.errors)} fallback="No errors">
            {(key) => (
              <li>
                <div>Property: {key}</div>
                <div>Value: {form.errors[key]}</div>
                <button type="button" onClick={() => form.clearErrors(key)}>
                  [Clear]
                </button>
              </li>
            )}
          </For>
        </ul>

        <div>
          <div>
            New error:
            <input type="text" value={errorKey()} onInput={(e) => setErrorKey(e.target.value)} />
            <input type="text" value={errorMessage()} onInput={(e) => setErrorMessage(e.target.value)} />
            <button type="button" onClick={() => form.setError(errorKey(), errorMessage())}>
              Set error
            </button>
          </div>

          <div>
            <button type="button" onClick={() => form.clearErrors()}>
              Clear All Errors
            </button>
          </div>
        </div>
      </section>
    </>
  )
}

UseForm.layout = MainLayout
