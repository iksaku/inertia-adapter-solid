import { createEffect } from 'solid-js'
import { Link, usePage } from 'inertia-adapter-solid'
import FnSiteLayout from '@/Layouts/FnSiteLayout'
const PageA = () => {
  createEffect(() => (window._inertia_page_props = usePage().props))
  return (
    <div>
      <span class="text">Simple Persistent Layout - Page A</span>
      <Link href="/persistent-layouts/function-declaration/simple/page-b">Page B</Link>
    </div>
  )
}
PageA.layout = FnSiteLayout
export default PageA
