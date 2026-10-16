import { setLayoutProps } from 'inertia-adapter-solid'
import Layout from '../../Layouts/SSRLayoutProps'
const Page = () => {
  setLayoutProps({ title: 'Client Page A Title' })
  return <p data-testid="page-content">Page A Content</p>
}
Page.layout = [Layout, { title: 'Page A Title' }]
export default Page
