import type { ParentProps } from 'solid-js'
const Layout = (props: ParentProps) => <div><h2 data-testid="layout-title">Default Title</h2>{props.children}</div>
const Page = () => <p data-testid="page-content">Page B Content</p>
Page.layout = Layout
export default Page
