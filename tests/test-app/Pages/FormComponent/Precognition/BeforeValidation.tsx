import { Form } from 'inertia-adapter-solid'
import { isEqual } from 'es-toolkit'
export default function PrecognitionBefore() {
  const handleBeforeValidation = (
    newRequest: {
      data: Record<string, unknown> | null
      touched: string[]
    },
    oldRequest: {
      data: Record<string, unknown> | null
      touched: string[]
    },
  ) => {
    const payloadIsCorrect =
      isEqual(newRequest, { data: { name: 'block' }, touched: ['name'] }) &&
      isEqual(oldRequest, { data: {}, touched: [] })
    if (payloadIsCorrect && newRequest.data?.name === 'block') {
      return false
    }
    return true
  }
  return (
    <div>
      <h1>Precognition - onBefore</h1>

      <Form action="/precognition/default" method="post" validationTimeout={100}>
        {(props1) => (
          <>
            <div>
              <label for="name">Name:</label>
              <input
                id="name"
                name="name"
                onInput={() =>
                  props1.validate('name', {
                    onBeforeValidation: handleBeforeValidation,
                  })
                }
              />
              {props1.invalid('name') && <p class="error">{props1.errors!.name}</p>}
            </div>

            <div>
              <label for="email">Email:</label>
              <input id="email" name="email" onInput={() => props1.validate('email')} />
              {props1.invalid('email') && <p class="error">{props1.errors!.email}</p>}
            </div>

            {props1.validating && <p class="validating">Validating...</p>}

            <button type="submit">Submit</button>
          </>
        )}
      </Form>
    </div>
  )
}
