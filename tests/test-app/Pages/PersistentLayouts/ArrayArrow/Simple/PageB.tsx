import { createEffect } from 'solid-js'
import { Link, usePage } from 'inertia-adapter-solid'
import SiteLayout from '@/Layouts/SiteLayout'
const PageB = () => {
  createEffect(() => (window._inertia_page_props = usePage().props))
  return (
    <div>
      <span class="text">Simple Persistent Layout - Page B</span>
      <Link href="/persistent-layouts/array-arrow/simple/page-a">Page A</Link>
    </div>
  )
}
PageB.layout = [SiteLayout]
export default PageB
