import { untrack } from 'solid-js'
import { Form } from 'inertia-adapter-solid'
export default (props1: {
  user: {
    name: string
  }
}) => {
  return (
    <Form action="/form-component/default-value" method="patch">
      {(props2) => (
        <>
          <h1>Form Default Values</h1>

          <div>
            <label for="name">Name</label>
            <input type="text" name="name" id="name" value={untrack(() => props1.user.name)} />
            <div id="error_name">{props2.errors['user.name']}</div>
          </div>

          <button type="submit">Submit</button>
        </>
      )}
    </Form>
  )
}
