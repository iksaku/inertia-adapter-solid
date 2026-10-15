import { createEffect } from 'solid-js'
import { Link, usePage } from 'inertia-adapter-solid'
import NestedLayout from '@/Layouts/NestedLayout'
import SiteLayout from '@/Layouts/SiteLayout'
const PageA = () => {
  createEffect(() => (window._inertia_page_props = usePage().props))
  return (
    <div>
      <span class="text">Nested Persistent Layout - Page A</span>
      <Link href="/persistent-layouts/shorthand/nested/page-b">Page B</Link>
    </div>
  )
}
PageA.layout = [SiteLayout, NestedLayout]
export default PageA
