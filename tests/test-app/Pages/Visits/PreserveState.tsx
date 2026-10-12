import { createUniqueId, mergeProps } from 'solid-js'
import { router } from 'inertia-adapter-solid'
export default (props0Input: {
  foo?: string
}) => {
  const props0 = mergeProps({ foo: 'default' }, props0Input)
  window._inertia_page_key = createUniqueId()
  const preserve = (e: MouseEvent) => {
    e.preventDefault()
    router.visit('/visits/preserve-state-page-two', { data: { foo: 'bar' }, preserveState: true })
  }
  const preserveFalse = (e: MouseEvent) => {
    e.preventDefault()
    router.visit('/visits/preserve-state-page-two', { data: { foo: 'baz' }, preserveState: false })
  }
  const preserveCallback = (e: MouseEvent) => {
    e.preventDefault()
    router.get(
      '/visits/preserve-state-page-two',
      { foo: 'callback-bar' },
      {
        preserveState: (page) => {
          console.log(JSON.stringify(page))
          return true
        },
      },
    )
  }
  const preserveCallbackFalse = (e: MouseEvent) => {
    e.preventDefault()
    router.get(
      '/visits/preserve-state-page-two',
      { foo: 'callback-baz' },
      {
        preserveState: (page) => {
          console.log(JSON.stringify(page))
          return false
        },
      },
    )
  }
  const preserveGet = (e: MouseEvent) => {
    e.preventDefault()
    router.get('/visits/preserve-state-page-two', { foo: 'get-bar' }, { preserveState: true })
  }
  const preserveGetFalse = (e: MouseEvent) => {
    e.preventDefault()
    router.get('/visits/preserve-state-page-two', { foo: 'get-baz' }, { preserveState: false })
  }
  return (
    <div>
      <span class="text">This is the page that demonstrates preserve state on manual visits</span>
      <span class="foo">Foo is now {props0.foo}</span>
      <label>
        Example Field
        <input type="text" name="example-field" class="field" />
      </label>

      <a href="#" onClick={preserve} class="preserve">
        [State] Preserve visit: true
      </a>
      <a href="#" onClick={preserveFalse} class="preserve-false">
        [State] Preserve visit: false
      </a>
      <a href="#" onClick={preserveCallback} class="preserve-callback">
        [State] Preserve Callback: true
      </a>
      <a href="#" onClick={preserveCallbackFalse} class="preserve-callback-false">
        [State] Preserve Callback: false
      </a>
      <a href="#" onClick={preserveGet} class="preserve-get">
        [State] Preserve GET: true
      </a>
      <a href="#" onClick={preserveGetFalse} class="preserve-get-false">
        [State] Preserve GET: false
      </a>
    </div>
  )
}
