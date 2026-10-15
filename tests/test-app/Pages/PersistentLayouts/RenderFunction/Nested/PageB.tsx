import { type JSX } from 'solid-js'
import { Link } from 'inertia-adapter-solid'
import NestedLayout from '@/Layouts/NestedLayout'
import SiteLayout from '@/Layouts/SiteLayout'
const PageB = () => {
  return (
    <div>
      <span class="text">Nested Persistent Layout - Page B</span>
      <Link href="/persistent-layouts/render-function/nested/page-a">Page A</Link>
    </div>
  )
}
PageB.layout = (props: { children: JSX.Element }) => {
  return (
    <SiteLayout>
      <NestedLayout children={props.children} />
    </SiteLayout>
  )
}
export default PageB
