import { onMount } from 'solid-js'
import { useForm } from 'inertia-adapter-solid'
export default () => {
  const form = useForm({ name: '' })
  let renderCount = 0
  renderCount++
  const { post } = form
  const submitForm = () => {
    post('/form-helper/stable-reference', {
      preserveState: true,
    })
  }
  onMount(() => {
    submitForm()
  })
  return (
    <div>
      <h1>useForm Stable Reference Test</h1>
      <div id="render-count">Render count: {renderCount}</div>
      {form.recentlySuccessful && <div id="recently-successful">Recently successful</div>}
      {form.wasSuccessful && <div id="was-successful">Was successful</div>}
    </div>
  )
}
