import { Link, router, useForm } from 'inertia-adapter-solid'

export default function Tags(props: { pageNumber: number; lastLoaded: number; propType: string }) {
  const form = useForm({ name: '' })
  const userTags = () => (props.propType === 'string' ? 'user' : ['user'])
  const prefetch = () => {
    router.prefetch('/prefetch/tags/2', { method: 'get' }, { cacheTags: userTags() })
    router.prefetch(
      '/prefetch/tags/3',
      { method: 'get' },
      { cacheFor: '1m', cacheTags: props.propType === 'string' ? 'product' : ['product'] },
    )
    router.prefetch('/prefetch/tags/6', { method: 'get' }, { cacheFor: '1m' })
  }
  return (
    <div>
      <div id="links">
        <Link href="/prefetch/tags/1" prefetch="hover" cacheTags={['user', 'profile']}>
          User Page 1
        </Link>
        <Link href="/prefetch/tags/2" prefetch="hover" cacheTags={['user', 'settings']}>
          User Page 2
        </Link>
        <Link href="/prefetch/tags/3" prefetch="hover" cacheTags={['product', 'catalog']}>
          Product Page 3
        </Link>
        <Link href="/prefetch/tags/4" prefetch="hover" cacheTags={['product', 'details']}>
          Product Page 4
        </Link>
        <Link href="/prefetch/tags/5" prefetch="hover" cacheTags={props.propType === 'string' ? 'admin' : ['admin']}>
          Admin Page 5
        </Link>
        <Link href="/prefetch/tags/6" prefetch="hover">
          Untagged Page 6
        </Link>
      </div>
      <div id="controls">
        <button id="flush-user" onClick={() => router.flushByCacheTags(userTags())}>
          Flush User Tags
        </button>
        <button id="flush-user-product" onClick={() => router.flushByCacheTags(['user', 'product'])}>
          Flush User + Product Tags
        </button>
        <button id="programmatic-prefetch" onClick={prefetch}>
          Programmatic Prefetch
        </button>
      </div>
      <div id="form-section">
        <h3>Form Test</h3>
        <form onSubmit={(event) => event.preventDefault()}>
          <input
            id="form-name"
            value={form.data.name}
            onInput={(event) => form.setData('name', event.currentTarget.value)}
            type="text"
            placeholder="Enter name"
          />
          <button
            id="submit-invalidate-user"
            onClick={(event) => {
              event.preventDefault()
              form.post('/dump/post', { invalidateCacheTags: userTags() })
            }}
          >
            Submit (Invalidate User)
          </button>
        </form>
      </div>
      <div>
        <div>This is tags page {props.pageNumber}</div>
        <div>
          Last loaded at <span id="last-loaded">{props.lastLoaded}</span>
        </div>
      </div>
    </div>
  )
}
