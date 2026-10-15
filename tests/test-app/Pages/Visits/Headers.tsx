import { router } from 'inertia-adapter-solid'
export default () => {
  const defaultHeadersMethod = (e: MouseEvent) => {
    e.preventDefault()
    router.visit('/dump/get')
  }
  const visitWithCustomHeaders = (e: MouseEvent) => {
    e.preventDefault()
    router.visit('/dump/get', { headers: { foo: 'bar' } })
  }
  const getMethod = (e: MouseEvent) => {
    e.preventDefault()
    router.get('/dump/get', {}, { headers: { bar: 'baz' } })
  }
  const postMethod = (e: MouseEvent) => {
    e.preventDefault()
    router.post('/dump/post', {}, { headers: { baz: 'foo' } })
  }
  const putMethod = (e: MouseEvent) => {
    e.preventDefault()
    router.put('/dump/put', {}, { headers: { foo: 'bar' } })
  }
  const patchMethod = (e: MouseEvent) => {
    e.preventDefault()
    router.patch('/dump/patch', {}, { headers: { bar: 'baz' } })
  }
  const deleteMethod = (e: MouseEvent) => {
    e.preventDefault()
    router.delete('/dump/delete', { headers: { baz: 'foo' } })
  }
  const overridden = (e: MouseEvent) => {
    e.preventDefault()
    router.post('/dump/post', {}, { headers: { bar: 'baz', 'X-Requested-With': 'custom' } })
  }
  return (
    <div>
      <span class="text">This is the page that demonstrates passing custom headers through manual visits</span>

      <a href="#" onClick={defaultHeadersMethod} class="default">
        Standard visit Link
      </a>

      <a href="#" onClick={visitWithCustomHeaders} class="visit">
        Specific visit Link
      </a>
      <a href="#" onClick={getMethod} class="get">
        GET Link
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

      <a href="#" onClick={overridden} class="overridden">
        Overriden Link
      </a>
    </div>
  )
}
