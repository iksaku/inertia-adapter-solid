import { createEffect } from 'solid-js'
import { Link, usePage } from 'inertia-adapter-solid'
import NestedLayout from '@/Layouts/NestedLayout'
import SiteLayout from '@/Layouts/SiteLayout'
const PageB = () => {
  createEffect(() => (window._inertia_page_props = usePage().props))
  return (
    <div>
      <span class="text">Nested Persistent Layout - Page B</span>
      <Link href="/persistent-layouts/shorthand/nested/page-a">Page A</Link>
    </div>
  )
}
PageB.layout = [SiteLayout, NestedLayout]
export default PageB
