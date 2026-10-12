import { createEffect, type JSX } from 'solid-js'
import { Link, usePage } from 'inertia-adapter-solid'
import SiteLayout from '@/Layouts/SiteLayout'
const PageB = () => {
  createEffect(() => (window._inertia_page_props = usePage().props))
  return (
    <div>
      <span class="text">Simple Persistent Layout - Page B</span>
      <Link href="/persistent-layouts/shorthand/simple/page-a">Page A</Link>
    </div>
  )
}
PageB.layout = (props: { children: JSX.Element }) => <SiteLayout children={props.children} />
export default PageB
