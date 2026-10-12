import type { FormComponentRef } from '@inertiajs/core'
import { Form } from 'inertia-adapter-solid'

// Solid's Form is not generic and refs are callbacks, not React ref objects.
export default () => {
  let form: FormComponentRef | undefined
  return (
    <div>
      <Form
        action="/users"
        method="post"
        ref={(value) => {
          form = value
        }}
      >
        <input name="name" />
        <input name="email" />
        <button type="submit">Submit</button>
      </Form>
      <button onClick={() => form?.clearErrors('name')}>Clear name error</button>
      <button onClick={() => form?.reset('email')}>Reset email</button>
    </div>
  )
}
