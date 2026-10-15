import { createEffect } from 'solid-js'
import { Link, usePage } from 'inertia-adapter-solid'
import SiteLayout from '@/Layouts/SiteLayout'
const PageA = () => {
  createEffect(() => (window._inertia_page_props = usePage().props))
  return (
    <div>
      <span class="text">Simple Persistent Layout - Page A</span>
      <Link href="/persistent-layouts/shorthand/simple/page-b">Page B</Link>
    </div>
  )
}
PageA.layout = SiteLayout
export default PageA
