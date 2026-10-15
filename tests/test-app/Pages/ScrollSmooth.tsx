import { onMount, onCleanup, Show } from 'solid-js'
import { Link } from 'inertia-adapter-solid'
export default (props0: {
  page: 'long' | 'short'
}) => {
  onMount(() => {
    document.documentElement.style.scrollBehavior = 'smooth'
    onCleanup(() => {
      document.documentElement.style.scrollBehavior = ''
    })
  })
  return (
    <div>
      <h1>{props0.page === 'long' ? 'Long Page' : 'Short Page'}</h1>

      <div style={{ height: props0.page === 'long' ? '2000px' : '100px' }}></div>

      <Show when={props0.page === 'long'} fallback={<Link href="/scroll-smooth/long">Go to Long Page</Link>}>
        {<Link href="/scroll-smooth/short">Go to Short Page</Link>}
      </Show>
    </div>
  )
}
