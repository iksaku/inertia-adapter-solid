import { type JSX } from 'solid-js'
import { Link } from 'inertia-adapter-solid'
import SiteLayout from '@/Layouts/SiteLayout'
const PageB = () => {
  return (
    <div>
      <span class="text">Simple Persistent Layout - Page B</span>
      <Link href="/persistent-layouts/render-function/simple/page-a">Page A</Link>
    </div>
  )
}
PageB.layout = (props: { children: JSX.Element }) => <SiteLayout children={props.children} />
export default PageB
