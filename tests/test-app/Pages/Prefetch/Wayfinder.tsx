import { router } from 'inertia-adapter-solid'
import { createSignal, onMount } from 'solid-js'

export default function Wayfinder() {
  const [isPrefetched, setIsPrefetched] = createSignal(false)
  const [isPrefetching, setIsPrefetching] = createSignal(false)
  const url = () => ({ url: '/prefetch/swr/4', method: 'get' as const })
  const checkStatus = () => {
    setIsPrefetched(!!router.getCached(url()))
    setIsPrefetching(!!router.getPrefetching(url()))
  }
  onMount(checkStatus)
  const prefetch = () =>
    router.prefetch(url(), {
      onPrefetching: () => {
        setIsPrefetching(true)
      },
      onPrefetched: () => {
        setIsPrefetching(false)
        setTimeout(checkStatus)
      },
    })
  return (
    <div>
      <p>
        Is Prefetched: <span id="is-prefetched">{isPrefetched().toString()}</span>
      </p>
      <p>
        Is Prefetching: <span id="is-prefetching">{isPrefetching().toString()}</span>
      </p>
      <button onClick={prefetch} id="test-prefetch">
        Test prefetch
      </button>
      <button
        onClick={() => {
          router.flush(url())
          checkStatus()
        }}
        id="test-flush"
      >
        Test flush
      </button>
      <button
        onClick={() => {
          router.flushAll()
          checkStatus()
        }}
        id="flush-all"
      >
        Flush all
      </button>
    </div>
  )
}
