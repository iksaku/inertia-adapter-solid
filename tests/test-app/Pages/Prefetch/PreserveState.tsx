import { router } from 'inertia-adapter-solid'

export default function PreserveState(props: { page: number; timestamp: number }) {
  return (
    <div>
      <div>Current Page: {props.page}</div>
      <div>Timestamp: {props.timestamp}</div>
      <h3>Prefetch:</h3>
      <button
        onClick={() =>
          router.prefetch('/prefetch/preserve-state', { method: 'get', data: { page: 2 } }, { cacheFor: '30s' })
        }
      >
        Prefetch Page 2
      </button>
      <h3>Load (should use cache if prefetched):</h3>
      <button onClick={() => router.get('/prefetch/preserve-state', { page: 2 }, { preserveState: false })}>
        Load Page 2 (preserveState: false)
      </button>
      <button onClick={() => router.get('/prefetch/preserve-state', { page: 2 }, { preserveState: true })}>
        Load Page 2 (preserveState: true)
      </button>
    </div>
  )
}
