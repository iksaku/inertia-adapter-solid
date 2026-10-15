import { Link } from 'inertia-adapter-solid'
export default (props: { navigatedTo: boolean }) => <div>
  <h1 data-testid="ssr-title">SSR Page 2</h1>
  <p data-testid="navigated-status">Navigated: {String(props.navigatedTo)}</p>
  <Link href="/ssr/page1" data-testid="back-link">Go back</Link>
</div>
