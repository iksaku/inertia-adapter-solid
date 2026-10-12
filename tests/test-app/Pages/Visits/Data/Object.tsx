import { router } from 'inertia-adapter-solid'
export default () => {
  const visitMethod = (e: MouseEvent) => {
    e.preventDefault()
    router.visit('/dump/get', { data: { foo: 'visit' } })
  }
  const getMethod = (e: MouseEvent) => {
    e.preventDefault()
    router.get('/dump/get', { bar: 'get' })
  }
  const postMethod = (e: MouseEvent) => {
    e.preventDefault()
    router.post('/dump/post', { baz: 'post' })
  }
  const putMethod = (e: MouseEvent) => {
    e.preventDefault()
    router.put('/dump/put', { foo: 'put' })
  }
  const patchMethod = (e: MouseEvent) => {
    e.preventDefault()
    router.patch('/dump/patch', { bar: 'patch' })
  }
  const deleteMethod = (e: MouseEvent) => {
    e.preventDefault()
    router.delete('/dump/delete', { data: { baz: 'delete' } })
  }
  const qsafDefault = (e: MouseEvent) => {
    e.preventDefault()
    router.visit('/dump/get', { data: { a: ['b', 'c'] } })
  }
  const qsafIndices = (e: MouseEvent) => {
    e.preventDefault()
    router.visit('/dump/get', { data: { a: ['b', 'c'] }, queryStringArrayFormat: 'indices' })
  }
  const qsafBrackets = (e: MouseEvent) => {
    e.preventDefault()
    router.visit('/dump/get', {
      data: { a: ['b', 'c'] },
      queryStringArrayFormat: 'brackets',
    })
  }
  const deleteQueryParam = (e: MouseEvent) => {
    e.preventDefault()
    router.visit('/dump/get', {
      data: { a: undefined },
    })
  }
  return (
    <div>
      <span class="text">This is the page that demonstrates manual visit data passing through plain objects</span>

      <a href="#" onClick={visitMethod} class="visit">
        Visit Link
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

      <a href="#" onClick={qsafDefault} class="qsaf-default">
        QSAF Defaults
      </a>
      <a href="#" onClick={qsafIndices} class="qsaf-indices">
        QSAF Indices
      </a>
      <a href="#" onClick={qsafBrackets} class="qsaf-brackets">
        QSAF Brackets
      </a>
      <a href="#" onClick={deleteQueryParam} class="delete-query-param">
        Delete Query Param
      </a>
    </div>
  )
}
