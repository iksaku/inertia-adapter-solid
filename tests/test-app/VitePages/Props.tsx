import { Link } from 'inertia-adapter-solid'
export default (props: { foo: string; count: number; items: string[] }) => <div>
  <h1 data-testid="props-title">Vite Props Page</h1><p data-testid="foo">foo: {props.foo}</p><p data-testid="count">count: {props.count}</p><p data-testid="items">items: {props.items.join(', ')}</p>
  <Link href="/auto" data-testid="home-link">Back to Home</Link>
</div>
