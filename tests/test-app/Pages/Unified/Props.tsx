import { Link } from 'inertia-adapter-solid'
export default (props: { foo: string; count: number; items: string[] }) => <div>
  <h1>Unified Props Test</h1><p id="foo">Foo: {props.foo}</p><p id="count">Count: {props.count}</p><p id="items">Items: {props.items.join(', ')}</p>
  <Link href="/unified/navigate">Navigate</Link>
</div>
