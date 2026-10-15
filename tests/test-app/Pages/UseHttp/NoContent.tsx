import { createSignal } from 'solid-js'
import { useHttp } from 'inertia-adapter-solid'
export default () => {
  const form = useHttp<{
    name: string
  }>({
    name: '',
  })
  const [responseValue, setResponseValue] = createSignal<string>('none')
  const performPost = async () => {
    try {
      const result = await form.post('/api/no-content')
      setResponseValue(JSON.stringify(result))
    } catch {
      setResponseValue('error')
    }
  }
  return (
    <div>
      <h1>useHttp No Content Test</h1>

      <section id="no-content-test">
        <label>
          Name
          <input
            type="text"
            id="no-content-name"
            value={form.data.name}
            onInput={(e) => form.setData('name', e.currentTarget.value)}
          />
        </label>
        <button onClick={performPost} id="no-content-button">
          Submit
        </button>
        {form.processing && <div id="no-content-processing">Processing...</div>}
        {form.wasSuccessful && <div id="no-content-success">Success</div>}
        <div id="no-content-response">Response: {responseValue()}</div>
      </section>
    </div>
  )
}
