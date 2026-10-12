import { useFormContext } from 'inertia-adapter-solid'
export default () => {
  const form = useFormContext()
  return form ? (
    <div>
      <span>Deeply Nested: Form is {form.isDirty ? 'dirty' : 'clean'}</span>
    </div>
  ) : (
    <div>No context</div>
  )
}
