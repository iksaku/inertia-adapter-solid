import { mergeProps, type JSX } from 'solid-js'
import type { Page } from '@inertiajs/core'
import { Link } from 'inertia-adapter-solid'
import WithScrollRegion from '@/Layouts/WithScrollRegion'
const PreserveScroll = (props0Input: {
  foo?: string
}) => {
  const props0 = mergeProps({ foo: 'default' }, props0Input)
  const preserveCallback = (page: Page) => {
    console.log(JSON.stringify(page))
    return true
  }
  const preserveCallbackFalse = (page: Page) => {
    console.log(JSON.stringify(page))
    return false
  }
  return (
    <div style={{ height: '800px', width: '600px' }}>
      <span class="text">This is the links page that demonstrates scroll preservation with scroll regions</span>
      <span class="foo">Foo is now {props0.foo}</span>

      <Link
        href="/links/preserve-scroll-page-two"
        preserveScroll
        data={{ foo: 'baz' }}
        data-testid="preserve"
        class="preserve"
      >
        Preserve Scroll
      </Link>
      <Link href="/links/preserve-scroll-page-two" data={{ foo: 'bar' }} data-testid="reset" class="reset">
        Reset Scroll
      </Link>

      <Link
        href="/links/preserve-scroll-page-two"
        preserveScroll={preserveCallback}
        data={{ foo: 'baz' }}
        data-testid="preserve-callback"
        class="preserve-callback"
      >
        Preserve Scroll (Callback)
      </Link>
      <Link
        href="/links/preserve-scroll-page-two"
        preserveScroll={preserveCallbackFalse}
        data={{ foo: 'foo' }}
        data-testid="reset-callback"
        class="reset-callback"
      >
        Reset Scroll (Callback)
      </Link>

      <a href="/non-inertia" class="off-site">
        Off-site link
      </a>

      <Link href="/article" data-testid="article" class="article">
        Article
      </Link>
    </div>
  )
}
PreserveScroll.layout = (props: { children: JSX.Element }) => <WithScrollRegion children={props.children} />
export default PreserveScroll
