import { createSignal } from 'solid-js'
import type { CacheForOption, LinkPrefetchOption, Method } from '@inertiajs/core'
import { Link } from 'inertia-adapter-solid'
export default () => {
  const [method, setMethod] = createSignal<Method>('get')
  const [href, setHref] = createSignal('/dump/get')
  const [data, setData] = createSignal({ foo: 'bar' })
  const [headers, setHeaders] = createSignal({ 'X-Custom-Header': 'value' })
  const [prefetch, setPrefetch] = createSignal<boolean | LinkPrefetchOption>(false)
  const [cacheFor, setCacheFor] = createSignal<CacheForOption>(0)
  const change = () => {
    setMethod('post')
    setHref('/dump/post')
    setData({ foo: 'baz' })
    setHeaders({ 'X-Custom-Header': 'new-value' })
  }
  const enablePrefetch = () => {
    setPrefetch('hover')
    setCacheFor('1s')
  }
  return (
    <div>
      <span class="text">
        This page demonstrates reactivity in Inertia links. Click the button to change the link properties.
      </span>

      <Link method={method()} href={href()} data={data()} headers={headers()}>
        Submit
      </Link>

      <button onClick={change}>Change Link Props</button>

      <Link href="/dump/get" prefetch={prefetch()} cacheFor={cacheFor()}>
        Prefetch Link
      </Link>

      <button onClick={enablePrefetch}>Enable Prefetch (1s cache)</button>
    </div>
  )
}
