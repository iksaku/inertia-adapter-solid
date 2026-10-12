import { createUniqueId, mergeProps, type JSX } from 'solid-js'
import type { Page } from '@inertiajs/core'
import { Link } from 'inertia-adapter-solid'
import WithoutScrollRegion from '@/Layouts/WithoutScrollRegion'
const PreserveState = (props0Input: {
  foo?: string
}) => {
  const props0 = mergeProps({ foo: 'default' }, props0Input)
  const preserveCallback = (page: Page) => {
    alert(page)
    return true
  }
  const preserveCallbackFalse = (page: Page) => {
    alert(page)
    return false
  }
  window._inertia_page_key = createUniqueId()
  return (
    <div>
      <span class="text">This is the links page that demonstrates preserve state on Links</span>
      <span class="foo">Foo is now {props0.foo}</span>
      <label>
        Example Field
        <input type="text" name="example-field" class="field" />
      </label>

      <Link href="/links/preserve-state-page-two" preserveState data={{ foo: 'bar' }} class="preserve">
        [State] Preserve: true
      </Link>
      <Link href="/links/preserve-state-page-two" preserveState={false} data={{ foo: 'baz' }} class="preserve-false">
        [State] Preserve: false
      </Link>

      <Link
        href="/links/preserve-state-page-two"
        preserveState={preserveCallback}
        data={{ foo: 'callback-bar' }}
        class="preserve-callback"
      >
        [State] Preserve Callback: true
      </Link>
      <Link
        href="/links/preserve-state-page-two"
        preserveState={preserveCallbackFalse}
        data={{ foo: 'callback-baz' }}
        class="preserve-callback-false"
      >
        [State] Preserve Callback: false
      </Link>
    </div>
  )
}
PreserveState.layout = (props: { children: JSX.Element }) => <WithoutScrollRegion children={props.children} />
export default PreserveState
