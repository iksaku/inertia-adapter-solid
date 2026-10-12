import { FormComponentRef } from '@inertiajs/core'
import { Form } from 'inertia-adapter-solid'
export default function Ref() {
  let formRef: FormComponentRef | null = null
  const submitProgrammatically = () => {
    formRef?.submit()
  }
  const resetForm = () => {
    formRef?.reset()
  }
  const resetNameField = () => {
    formRef?.reset('name')
  }
  const clearAllErrors = () => {
    formRef?.clearErrors()
  }
  const setTestError = () => {
    formRef?.setError('name', 'This is a test error')
  }
  const setCurrentAsDefaults = () => {
    formRef?.defaults()
  }
  const callPrecognitionMethods = () => {
    const validator = formRef?.validator()
    if (validator && !formRef?.touched('company') && !formRef?.valid('company')) {
      formRef?.validate({ only: ['company'] })
    }
  }
  return (
    <div>
      <h1>Form Ref Test</h1>

      <Form ref={(value) => (formRef = value)} action="/dump/post" method="post">
        {(props1) => (
          <>
            {/* State display for testing */}
            <div>Form is {props1.isDirty ? 'dirty' : 'clean'}</div>
            {props1.hasErrors && <div>Form has errors</div>}
            {props1.errors!.name && <div id="error_name">{props1.errors!.name}</div>}

            <div>
              <input type="text" name="name" placeholder="Name" value="John Doe" />
            </div>

            <div>
              <input type="email" name="email" placeholder="Email" value="john@example.com" />
            </div>

            <div>
              <button type="submit">Submit via Form</button>
            </div>
          </>
        )}
      </Form>

      <div>
        <button onClick={submitProgrammatically}>Submit Programmatically</button>
        <button onClick={resetForm}>Reset Form</button>
        <button onClick={resetNameField}>Reset Name Field</button>
        <button onClick={clearAllErrors}>Clear Errors</button>
        <button onClick={setTestError}>Set Test Error</button>
        <button onClick={setCurrentAsDefaults}>Set Current as Defaults</button>
        <button onClick={callPrecognitionMethods}>Call Precognition Methods</button>
      </div>
    </div>
  )
}
