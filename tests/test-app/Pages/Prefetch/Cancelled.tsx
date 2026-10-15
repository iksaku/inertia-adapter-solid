import { router } from 'inertia-adapter-solid'
import { createSignal, onMount, onCleanup } from 'solid-js'

const url = '/prefetch/swr/1'
export default function Cancelled() {
  const [prefetchId, setPrefetchId] = createSignal('')
  const [cached, setCached] = createSignal(false)
  const [events, setEvents] = createSignal<string[]>([])
  let cancelToken: { cancel(): void } | null = null
  onMount(() => {
    const timer = setInterval(() => {
      setPrefetchId(router.getPrefetching(url)?.params.id ?? '')
      setCached(router.getCached(url) !== null)
    }, 50)
    onCleanup(() => clearInterval(timer))
  })
  const visit = () =>
    router.visit(url, {
      onCancel: () => {
        setEvents((events) => [...events, 'cancel'])
      },
      onFinish: () => {
        setEvents((events) => [...events, 'finish'])
      },
      onSuccess: () => {
        setEvents((events) => [...events, 'success'])
      },
    })
  return (
    <div>
      <button
        onClick={() =>
          router.prefetch(
            url,
            {
              onCancelToken: (token) => {
                cancelToken = token
              },
            },
            { cacheTags: ['example'] },
          )
        }
      >
        Prefetch
      </button>
      <button
        onClick={() =>
          router.prefetch(url, {
            onCancelToken: (token) => {
              cancelToken = token
            },
            onCancel: () => router.prefetch(url),
          })
        }
      >
        Prefetch With Replacement
      </button>
      <button onClick={() => router.prefetch(url, { onCancelToken: (token) => token.cancel() })}>
        Prefetch And Cancel
      </button>
      <button
        onClick={() =>
          router.prefetch(url, { onCancelToken: (token) => token.cancel(), onCancel: () => router.prefetch(url) })
        }
      >
        Prefetch And Cancel With Replacement
      </button>
      <button
        onClick={() => {
          cancelToken?.cancel()
          cancelToken = null
        }}
      >
        Cancel Prefetch
      </button>
      <button onClick={() => router.flush(url)}>Flush</button>
      <button onClick={() => router.flushByCacheTags('example')}>Flush By Cache Tags</button>
      <button onClick={() => router.flushAll()}>Flush All</button>
      <button onClick={visit}>Visit</button>
      <div>
        Prefetching: <span id="prefetch-status">{prefetchId() ? 'yes' : 'no'}</span>
      </div>
      <div>
        Prefetch ID: <span id="prefetch-id">{prefetchId()}</span>
      </div>
      <div>
        Cached: <span id="cache-status">{cached() ? 'yes' : 'no'}</span>
      </div>
      <div>
        Visit events: <span id="visit-events">{events().join(',')}</span>
      </div>
    </div>
  )
}
