import { Form } from 'inertia-adapter-solid'
export default () => {
  return (
    <>
      <Form
        action="/form-component/view-transition"
        method="post"
        options={{
          viewTransition: (viewTransition) => {
            viewTransition.ready.then(() => console.log('ready'))
            viewTransition.updateCallbackDone.then(() => console.log('updateCallbackDone'))
            viewTransition.finished.then(() => console.log('finished'))
          },
        }}
      >
        <button type="submit">Submit with View Transition</button>
      </Form>
    </>
  )
}
