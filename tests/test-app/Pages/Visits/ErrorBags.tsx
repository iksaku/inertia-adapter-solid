import { router } from 'inertia-adapter-solid'
export default () => {
  const defaultVisit = (e: MouseEvent) => {
    e.preventDefault()
    router.post('/dump/post')
  }
  const basicVisit = (e: MouseEvent) => {
    e.preventDefault()
    router.visit('/dump/post', { method: 'post', data: { foo: 'bar' }, errorBag: 'visitErrorBag' })
  }
  const postVisit = (e: MouseEvent) => {
    e.preventDefault()
    router.post('/dump/post', { foo: 'baz' }, { errorBag: 'postErrorBag' })
  }
  return (
    <div>
      <span class="text">This is the page that demonstrates error bags using manual visits</span>
      <a href="#" onClick={defaultVisit} class="default">
        Default visit
      </a>
      <a href="#" onClick={basicVisit} class="visit">
        Basic visit
      </a>
      <a href="#" onClick={postVisit} class="get">
        POST visit
      </a>
    </div>
  )
}
