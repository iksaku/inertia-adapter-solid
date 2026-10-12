import { Form } from 'inertia-adapter-solid'
export default (props1: {
  disable: boolean
}) => {
  return (
    <div>
      <h1>Form Disable While Processing Test</h1>

      <Form
        method="post"
        action={`/form-component/disable-while-processing/${props1.disable ? 'yes' : 'no'}/submit`}
        disableWhileProcessing={props1.disable}
      >
        {(props2) => (
          <>
            <div>
              <input type="text" name="name" placeholder="Name" value="John Doe" />
              {props2.errors!.name && <p id="error_name">{props2.errors!.name}</p>}
            </div>

            <div>
              <button type="submit">Submit</button>
            </div>
          </>
        )}
      </Form>
    </div>
  )
}
