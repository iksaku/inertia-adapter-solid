import { router } from 'inertia-adapter-solid'
export default () => {
  const standardVisitMethod = (e: MouseEvent) => {
    e.preventDefault()
    router.visit('/dump/get')
  }
  const specificVisitMethod = (e: MouseEvent) => {
    e.preventDefault()
    router.visit('/dump/patch', { method: 'patch' })
  }
  const getMethod = (e: MouseEvent) => {
    e.preventDefault()
    router.get('/dump/get')
  }
  const postMethod = (e: MouseEvent) => {
    e.preventDefault()
    router.post('/dump/post')
  }
  const putMethod = (e: MouseEvent) => {
    e.preventDefault()
    router.put('/dump/put')
  }
  const patchMethod = (e: MouseEvent) => {
    e.preventDefault()
    router.patch('/dump/patch')
  }
  const deleteMethod = (e: MouseEvent) => {
    e.preventDefault()
    router.delete('/dump/delete')
  }
  return (
    <div>
      <span class="text">This is the page that demonstrates manual visit methods</span>

      <a href="#" onClick={standardVisitMethod} class="visit-get">
        Standard visit Link
      </a>
      <a href="#" onClick={specificVisitMethod} class="visit-specific">
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
    </div>
  )
}
