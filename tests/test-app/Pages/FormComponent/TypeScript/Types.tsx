import { Form } from 'inertia-adapter-solid'

// Field-key restrictions on generic React Form props are not in Solid's API.
export default () => (
  <div>
    <Form
      method="post"
      action="/form-component/types"
      resetOnSuccess={['name', 'email']}
      resetOnError={['name']}
      onSubmitComplete={(slot) => {
        slot.reset('name')
        slot.reset('email')
      }}
    >
      {(slot) => (
        <div>
          {slot.errors.name && <span>{slot.errors.name}</span>}
          <button
            type="button"
            onClick={() => {
              console.log(slot.getData())
              slot.clearErrors('name', 'email')
            }}
          >
            Clear errors
          </button>
        </div>
      )}
    </Form>
    <Form method="post" action="/form-component/types" resetOnSuccess={true} resetOnError={false}>
      <div>Boolean reset</div>
    </Form>
  </div>
)
