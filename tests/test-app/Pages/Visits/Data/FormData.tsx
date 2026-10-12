import { router } from 'inertia-adapter-solid'
export default () => {
  const visitMethod = (e: MouseEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('foo', 'visit')
    router.visit('/dump/post', { method: 'post', data: formData })
  }
  const postMethod = (e: MouseEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('baz', 'post')
    router.post('/dump/post', formData)
  }
  const putMethod = (e: MouseEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('foo', 'put')
    router.put('/dump/put', formData)
  }
  const patchMethod = (e: MouseEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('bar', 'patch')
    router.patch('/dump/patch', formData)
  }
  const deleteMethod = (e: MouseEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('baz', 'delete')
    router.delete('/dump/delete', { data: formData })
  }
  return (
    <div>
      <span class="text">This is the page that demonstrates manual visit data passing through FormData objects</span>

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
