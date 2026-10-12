import { Form } from 'inertia-adapter-solid'
export default () => {
  return (
    <div>
      <h1>Form Submit On Enter</h1>

      <Form action="/dump/post" method="post">
        {(props1) => (
          <textarea
            name="message"
            id="message"
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                props1.submit()
              }
            }}
          />
        )}
      </Form>
    </div>
  )
}
