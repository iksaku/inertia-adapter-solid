import type { Method } from '@inertiajs/core'
import { Link } from 'inertia-adapter-solid'
export default (props0: {
  method: Method
}) => {
  return (
    <div>
      <span class="text">This is the links page that demonstrates inertia-links without the 'as' warning</span>

      <Link method={props0.method} href="/example" class="get" as="button">
        {props0.method} button Link
      </Link>
    </div>
  )
}
