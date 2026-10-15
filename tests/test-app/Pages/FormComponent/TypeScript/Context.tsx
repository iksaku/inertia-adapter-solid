import { useFormContext } from 'inertia-adapter-solid'

// Solid exposes an unparameterized context. Field-key rejection from the
// React generic context is inapplicable; the public methods remain covered.
export default () => {
  const form = useFormContext()
  if (!form) return null
  form.clearErrors('name')
  form.reset('email')
  form.setError('name', 'Error')
  const data = form.getData()
  console.log(data.name, data.email)
  return <div>Context component</div>
}
