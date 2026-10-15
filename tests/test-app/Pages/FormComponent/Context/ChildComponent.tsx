import { useFormContext } from 'inertia-adapter-solid'
export default (props1: {
  formId?: string
}) => {
  const form = useFormContext()
  return (
    <>
      {form ? (
        <div>
          <span>Child: Form is {form.isDirty ? 'dirty' : 'clean'}</span>
          {form.hasErrors && <span> | Child: Form has errors</span>}
          {form.processing && <span> | Child: Form is processing</span>}
          {form.wasSuccessful && <span> | Child: Form was successful</span>}
          {form.recentlySuccessful && <span> | Child: Form recently successful</span>}
          {form.errors.name && <span> | Error: {form.errors.name}</span>}
        </div>
      ) : (
        <div>No form context available</div>
      )}

      <button
        type="button"
        onClick={() => form?.setError('name', props1.formId ? 'Error from child' : 'Error set from child component')}
      >
        Set Error
      </button>
      <button type="button" onClick={() => form?.clearErrors('name')}>
        Clear Error
      </button>
      {!props1.formId && (
        <>
          <button type="button" onClick={() => form?.submit()}>
            Submit from Child
          </button>
          <button type="button" onClick={() => form?.reset()}>
            Reset from Child
          </button>
          <button type="button" onClick={() => form?.defaults()}>
            Set Defaults
          </button>
        </>
      )}
    </>
  )
}
