import { Link, WhenMounted } from 'inertia-adapter-solid'
import WhenMountedChild from '../../Components/WhenMountedChild'
import WhenMountedFallback from '../../Components/WhenMountedFallback'
export default () => <div>
  <h1 data-testid="ssr-title">SSR WhenMounted</h1>
  <WhenMounted fallback={<WhenMountedFallback />}>
    <p data-testid="when-mounted-content">Client path: {window.location.pathname}</p><WhenMountedChild />
  </WhenMounted>
  <Link data-testid="leave-link" href="/ssr/page2">Leave</Link>
  <Link data-testid="revisit-link" href="/ssr/when-mounted">Revisit</Link>
</div>
