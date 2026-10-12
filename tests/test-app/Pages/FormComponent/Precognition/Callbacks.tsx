import { createSignal } from 'solid-js'
import { Form } from 'inertia-adapter-solid'
export default () => {
  const [successCalled, setSuccessCalled] = createSignal(false)
  const [errorCalled, setErrorCalled] = createSignal(false)
  const [finishCalled, setFinishCalled] = createSignal(false)
  return (
    <div>
      <h1>Form Precognition Callbacks</h1>

      <h2>Callbacks Test</h2>
      <Form action="/precognition/default" method="post" validationTimeout={100}>
        {(props1) => (
          <>
            <div>
              <input name="name" placeholder="Name" onBlur={() => props1.touch('name')} />
            </div>

            {props1.validating && <p>Validating...</p>}
            {successCalled() && <p>onPrecognitionSuccess called!</p>}
            {errorCalled() && <p>onValidationError called!</p>}
            {finishCalled() && <p>onFinish called!</p>}

            <button
              type="button"
              onClick={() => {
                setSuccessCalled(false)
                setErrorCalled(false)
                setFinishCalled(false)
                props1.validate({
                  onPrecognitionSuccess: () => {
                    setSuccessCalled(true)
                  },
                  onValidationError: () => {
                    setErrorCalled(true)
                  },
                  onFinish: () => {
                    setFinishCalled(true)
                  },
                })
              }}
            >
              Validate
            </button>
          </>
        )}
      </Form>
    </div>
  )
}
