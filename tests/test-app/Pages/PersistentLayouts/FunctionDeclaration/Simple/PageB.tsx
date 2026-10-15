import { createEffect } from 'solid-js'
import { Link, usePage } from 'inertia-adapter-solid'
import FnSiteLayout from '@/Layouts/FnSiteLayout'
const PageB = () => {
  createEffect(() => (window._inertia_page_props = usePage().props))
  return (
    <div>
      <span class="text">Simple Persistent Layout - Page B</span>
      <Link href="/persistent-layouts/function-declaration/simple/page-a">Page A</Link>
    </div>
  )
}
PageB.layout = FnSiteLayout
export default PageB
