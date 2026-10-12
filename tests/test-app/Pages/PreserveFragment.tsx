import { Link, router, usePage } from 'inertia-adapter-solid'

export default function PreserveFragment() {
  const page = usePage()
  return (
    <div>
      <span id="current-url">{page.url}</span>
      <Link href="/preserve-fragment/redirect#my-fragment" id="link-with-fragment">
        Link with fragment
      </Link>
      <a
        href="#"
        id="manual-visit-with-fragment"
        onClick={(event) => {
          event.preventDefault()
          router.visit('/preserve-fragment/redirect#my-fragment')
        }}
      >
        Manual visit with fragment
      </a>
    </div>
  )
}
