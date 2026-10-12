import type { FormComponentSlotProps } from '@inertiajs/core'
import { Form } from 'inertia-adapter-solid'

// Solid provides reactive, unparameterized slots rather than generic field keys.
export default () => (
  <Form action="/users" method="post">
    {(slot: FormComponentSlotProps) => (
      <div>
        <input name="name" />
        {slot.errors.name && <span>{slot.errors.name}</span>}
        <input name="email" />
        {slot.errors.email && <span>{slot.errors.email}</span>}
        <button
          type="button"
          onClick={() => {
            console.log(slot.getData())
            slot.clearErrors('name', 'email')
            slot.reset('name', 'email')
            slot.setError('name', 'Name is required')
            slot.setError({ name: 'Name is required', email: 'Email is invalid' })
            console.log(slot.valid('name'), slot.invalid('email'))
          }}
        >
          Test slot methods
        </button>
        <button type="submit">Submit</button>
      </div>
    )}
  </Form>
)
