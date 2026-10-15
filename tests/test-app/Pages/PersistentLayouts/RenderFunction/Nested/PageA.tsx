import { type JSX } from 'solid-js'
import { Link } from 'inertia-adapter-solid'
import NestedLayout from '@/Layouts/NestedLayout'
import SiteLayout from '@/Layouts/SiteLayout'
const PageA = () => {
  return (
    <div>
      <span class="text">Nested Persistent Layout - Page A</span>
      <Link href="/persistent-layouts/render-function/nested/page-b">Page B</Link>
    </div>
  )
}
PageA.layout = (props: { children: JSX.Element }) => {
  return (
    <SiteLayout>
      <NestedLayout children={props.children} />
    </SiteLayout>
  )
}
export default PageA
