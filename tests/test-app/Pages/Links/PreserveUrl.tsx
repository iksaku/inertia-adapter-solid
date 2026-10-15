import { mergeProps, For, Show } from 'solid-js'
import { Link, router } from 'inertia-adapter-solid'
interface PreserveUrlProps {
  foo?: string
  items?: {
    data: string[]
    next_page_url?: string
  }
}
const PreserveUrl = (props0Input: PreserveUrlProps) => {
  const props0 = mergeProps({ foo: 'default' }, props0Input)
  const loadMore = () => {
    if (props0.items?.next_page_url) {
      router.visit(props0.items.next_page_url, {
        only: ['items'],
        preserveState: true,
        preserveScroll: true,
        preserveUrl: true,
      })
    }
  }
  return (
    <div>
      <span class="text">This is the links page that demonstrates preserve url on Links</span>
      <span class="foo">Foo is now {props0.foo}</span>

      <Link href="/links/preserve-url-page-two" preserveUrl data={{ foo: 'bar' }} class="preserve">
        [URL] Preserve: true
      </Link>
      <Link href="/links/preserve-url-page-two" preserveUrl={false} data={{ foo: 'baz' }} class="preserve-false">
        [URL] Preserve: false
      </Link>

      <Show when={props0.items}>
        {(items) => (
          <div class="items-section">
            <div class="items">{<For each={items().data}>{(item) => <div class="item">{item}</div>}</For>}</div>

            <span class="items-loaded">Items loaded: {items().data.length}</span>
            <span class="has-next-page">{items().next_page_url ? 'true' : 'false'}</span>

            <Show when={items().next_page_url}>
              {(url) => (
                <Link href={url()} only={['items']} preserveState preserveScroll preserveUrl class="load-more">
                  Load More
                </Link>
              )}
            </Show>

            <Show when={items().next_page_url}>
              {
                <button onClick={loadMore} class="load-more-router">
                  Load More Router
                </button>
              }
            </Show>
          </div>
        )}
      </Show>
    </div>
  )
}
export default PreserveUrl
