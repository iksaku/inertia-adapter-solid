import { useForm } from 'inertia-adapter-solid'
export default () => {
  const form = useForm({ name: 'foo', remember: false })
  const postForm = () => {
    form.transform((data) => ({ ...data, name: 'bar' }))
    form.post('/dump/post')
  }
  const putForm = () => {
    form.transform((data) => ({ ...data, name: 'baz' }))
    form.put('/dump/put')
  }
  const patchForm = () => {
    form.transform((data) => ({ ...data, name: 'foo' }))
    form.patch('/dump/patch')
  }
  const deleteForm = () => {
    form.transform((data) => ({ ...data, name: 'bar' }))
    form.delete('/dump/delete')
  }
  return (
    <div>
      <label>
        Full Name
        <input
          type="text"
          id="name"
          name="name"
          onInput={(e) => form.setData('name', e.currentTarget.value)}
          value={form.data.name}
        />
      </label>
      <label>
        Remember Me
        <input
          type="checkbox"
          id="remember"
          name="remember"
          onInput={(e) => form.setData('remember', e.currentTarget.checked)}
          checked={form.data.remember}
        />
      </label>

      <button onClick={postForm} class="post">
        POST form
      </button>
      <button onClick={putForm} class="put">
        PUT form
      </button>
      <button onClick={patchForm} class="patch">
        PATCH form
      </button>
      <button onClick={deleteForm} class="delete">
        DELETE form
      </button>
    </div>
  )
}
