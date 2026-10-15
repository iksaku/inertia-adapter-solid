import { type JSX } from 'solid-js'
import { Link } from 'inertia-adapter-solid'
import SiteLayout from '@/Layouts/SiteLayout'
const PageA = () => {
  return (
    <div>
      <span class="text">Simple Persistent Layout - Page A</span>
      <Link href="/persistent-layouts/render-function/simple/page-b">Page B</Link>
    </div>
  )
}
PageA.layout = (props: { children: JSX.Element }) => <SiteLayout children={props.children} />
export default PageA
