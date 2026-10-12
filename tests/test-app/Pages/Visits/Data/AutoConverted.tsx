import { router } from 'inertia-adapter-solid'
export default () => {
  const formData = { file: new File([], 'example.jpg'), foo: 'bar' }
  const visitMethod = (e: MouseEvent) => {
    e.preventDefault()
    router.visit('/dump/post', { method: 'post', data: formData })
  }
  const postMethod = (e: MouseEvent) => {
    e.preventDefault()
    router.post('/dump/post', formData)
  }
  const putMethod = (e: MouseEvent) => {
    e.preventDefault()
    router.put('/dump/put', formData)
  }
  const patchMethod = (e: MouseEvent) => {
    e.preventDefault()
    router.patch('/dump/patch', formData)
  }
  const deleteMethod = (e: MouseEvent) => {
    e.preventDefault()
    router.delete('/dump/delete', { data: formData })
  }
  return (
    <div>
      <span class="text">
        This is the page that demonstrates automatic conversion of plain objects to form-data using manual visits
      </span>

      <a href="#" onClick={visitMethod} class="visit">
        Visit Link
      </a>
      <a href="#" onClick={postMethod} class="post">
        POST Link
      </a>
      <a href="#" onClick={putMethod} class="put">
        PUT Link
      </a>
      <a href="#" onClick={patchMethod} class="patch">
        PATCH Link
      </a>
      <a href="#" onClick={deleteMethod} class="delete">
        DELETE Link
      </a>
    </div>
  )
}
