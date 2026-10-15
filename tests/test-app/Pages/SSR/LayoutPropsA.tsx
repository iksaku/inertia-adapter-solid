import type { ParentProps } from 'solid-js'
const Layout = (props: ParentProps) => <div><h2 data-testid="layout-title">Page A Title</h2>{props.children}</div>
const Page = () => <p data-testid="page-content">Page A Content</p>
Page.layout = Layout
export default Page
