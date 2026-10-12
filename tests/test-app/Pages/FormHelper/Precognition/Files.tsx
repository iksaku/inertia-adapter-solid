import { createSignal, createEffect, on } from 'solid-js'
import { useForm } from 'inertia-adapter-solid'
export default () => {
  const form = useForm<{
    name: string
    avatar: File | null
  }>({
    name: '',
    avatar: null,
  })
    .withPrecognition('post', '/precognition/files')
    .setValidationTimeout(100)
  const [validateFiles, setValidateFiles] = createSignal(false)
  createEffect(
    on(
      () => [form, validateFiles()],
      () => {
        if (validateFiles()) {
          form.validateFiles()
        } else {
          form.withoutFileValidation()
        }
      },
    ),
  )
  const handleFileChange = (
    e: Event & {
      currentTarget: HTMLInputElement
    },
  ) => {
    const file = e.currentTarget.files?.[0] || null
    form.setData('avatar', file)
  }
  return (
    <div>
      <div>
        <input
          value={form.data.name}
          name="name"
          placeholder="Name"
          onInput={(e) => form.setData('name', e.currentTarget.value)}
          onBlur={() => form.validate('name')}
        />
        {form.invalid('name') && <p>{form.errors.name}</p>}
        {form.valid('name') && <p>Name is valid!</p>}
      </div>

      <div>
        <input type="file" name="avatar" id="avatar" onInput={handleFileChange} />
        {form.invalid('avatar') && <p>{form.errors.avatar}</p>}
        {form.valid('avatar') && <p>Avatar is valid!</p>}
      </div>

      {form.validating && <p>Validating...</p>}

      <button type="button" onClick={() => setValidateFiles(!validateFiles())}>
        Toggle Validate Files ({validateFiles() ? 'enabled' : 'disabled'})
      </button>

      <button type="button" onClick={() => form.validate({ only: ['name', 'avatar'] })}>
        Validate Both
      </button>
    </div>
  )
}
