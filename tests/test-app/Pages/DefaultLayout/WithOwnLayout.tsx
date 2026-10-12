import { type JSX } from 'solid-js'
import { Link } from 'inertia-adapter-solid'
import PageLayout from '@/Layouts/PageLayout'
const WithOwnLayout = () => {
  return (
    <div>
      <span id="text">DefaultLayout/WithOwnLayout</span>
      <Link href="/default-layout">Back to Index</Link>
    </div>
  )
}
WithOwnLayout.layout = (props: { children: JSX.Element }) => <PageLayout children={props.children} />
export default WithOwnLayout
