import { Link } from 'inertia-adapter-solid'
export default (props: { example: string }) => <div>
  <h1 data-testid="vite-title">Vite Plugin Test Page</h1><p data-testid="vite-example">Example: {props.example}</p>
  <Link href="/auto/props" data-testid="props-link">Go to Props</Link>
</div>
