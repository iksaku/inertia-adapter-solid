import { Link } from 'inertia-adapter-solid'
import { createSignal } from 'solid-js'

export default function DataLoading() {
  const [finished, setFinished] = createSignal(0)
  let cancelFirst: (() => void) | undefined

  return (
    <div>
      <Link href="/sleep" class="get">
        First
      </Link>
      <Link href="/sleep" class="get">
        Second
      </Link>
      <p>
        <Link
          href="/links/data-loading"
          async
          preserveState
          onCancelToken={(token) => {
            cancelFirst ??= () => token.cancel()
          }}
          onFinish={() => setFinished((count) => count + 1)}
        >
          Concurrent
        </Link>{' '}
        <button type="button" onClick={() => cancelFirst?.()}>
          Cancel first request
        </button>
      </p>
      <p>Finished requests: {finished()}</p>
    </div>
  )
}
