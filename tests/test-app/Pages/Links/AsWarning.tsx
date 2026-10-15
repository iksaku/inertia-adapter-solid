import type { Method } from '@inertiajs/core'
import { Link } from 'inertia-adapter-solid'
export default (props0: {
  method: Method
}) => {
  return (
    <div>
      <span class="text">This is the links page that demonstrates inertia-links with an 'as' warning</span>

      <Link method={props0.method} href="/example" class="get">
        {props0.method} Link
      </Link>
    </div>
  )
}
