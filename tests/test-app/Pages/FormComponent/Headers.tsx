import { createSignal } from 'solid-js'
import { Form } from 'inertia-adapter-solid'
export default () => {
  const [headers, setHeaders] = createSignal<Record<string, string>>({
    'X-Foo': 'Bar',
  })
  function addCustomHeader() {
    setHeaders((previousHeaders) => ({
      ...previousHeaders,
      'X-Custom': 'MyCustomValue',
    }))
  }
  return (
    <Form action="/dump/post" method="post" headers={headers()}>
      <h1>Form Headers</h1>

      <div>
        <button type="button" onClick={addCustomHeader}>
          Add Custom Header
        </button>
      </div>

      <button type="submit">Submit</button>
    </Form>
  )
}
