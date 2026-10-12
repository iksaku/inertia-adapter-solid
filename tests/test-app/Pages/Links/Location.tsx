import { Link } from 'inertia-adapter-solid'
export default () => {
  return (
    <div>
      <span class="text">This is the links page that demonstrates location visits inertia-links</span>

      <Link href="/location" replace class="example">
        Location visit
      </Link>
    </div>
  )
}
