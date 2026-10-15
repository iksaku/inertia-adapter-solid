import { createSignal } from 'solid-js'
import { Link } from 'inertia-adapter-solid'
export default () => {
  const [href, setHref] = createSignal('/sleep')
  return (
    <div>
      <button onClick={() => setHref('/something-else')}>Change URL</button>
      <Link href={href()} class="get">
        The Link
      </Link>
    </div>
  )
}
