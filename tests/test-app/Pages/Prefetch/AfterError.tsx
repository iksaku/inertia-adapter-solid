import { router } from 'inertia-adapter-solid'

export default function AfterError() {
  return (
    <div>
      <button onClick={() => router.prefetch('/prefetch/swr/1', { method: 'get' }, { cacheFor: 5000 })}>
        Prefetch Page
      </button>
      <button onClick={() => router.visit('/prefetch/swr/1')}>Visit Page</button>
      <button onClick={() => router.prefetch('/non-inertia', { method: 'get' }, { cacheFor: 5000 })}>
        Prefetch Non-Inertia
      </button>
      <button onClick={() => router.visit('/non-inertia')}>Visit Non-Inertia</button>
    </div>
  )
}
