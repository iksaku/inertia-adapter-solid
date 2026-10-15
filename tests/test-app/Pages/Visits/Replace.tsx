import { router } from 'inertia-adapter-solid'
export default () => {
  const replace = (e: MouseEvent) => {
    e.preventDefault()
    router.visit('/dump/get', { replace: true })
  }
  const replaceFalse = (e: MouseEvent) => {
    e.preventDefault()
    router.visit('/dump/get', { replace: false })
  }
  const replaceGet = (e: MouseEvent) => {
    e.preventDefault()
    router.get('/dump/get', {}, { replace: true })
  }
  const replaceGetFalse = (e: MouseEvent) => {
    e.preventDefault()
    router.get('/dump/get', {}, { replace: false })
  }
  return (
    <div>
      <span class="text">This is the links page that demonstrates manual replace</span>

      <a href="#" onClick={replace} class="replace">
        [State] Replace visit: true
      </a>
      <a href="#" onClick={replaceFalse} class="replace-false">
        [State] Replace visit: false
      </a>
      <a href="#" onClick={replaceGet} class="replace-get">
        [State] Replace GET: true
      </a>
      <a href="#" onClick={replaceGetFalse} class="replace-get-false">
        [State] Replace GET: false
      </a>
    </div>
  )
}
