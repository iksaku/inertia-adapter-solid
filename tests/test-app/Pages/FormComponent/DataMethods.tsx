import { Form } from 'inertia-adapter-solid'
export default () => {
  return (
    <div>
      <h1>Test getData() and getFormData() Methods</h1>

      <Form>
        {(props1) => (
          <>
            <input type="text" name="name" id="name" />

            <button
              type="button"
              onClick={() => {
                const data = props1.getData()
                console.log('getData result: ' + JSON.stringify(data))
              }}
            >
              Test getData()
            </button>

            <button
              type="button"
              onClick={() => {
                const formData = props1.getFormData()
                console.log('getFormData entries: ' + JSON.stringify(Object.fromEntries(formData.entries())))
              }}
            >
              Test getFormData()
            </button>
          </>
        )}
      </Form>
    </div>
  )
}
