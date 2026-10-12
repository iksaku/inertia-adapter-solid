import { Link, router } from 'inertia-adapter-solid'
// No serverHead bridge: this option is explicitly never in the Solid adapter.
export default (props: { foo: string; next: string }) => <div><h1>Server Head</h1><p id="foo">{props.foo}</p>
  <button onClick={() => router.reload({ only: ['foo'] })}>Reload foo</button>
  <button onClick={() => router.replaceProp('head', ['<title data-inertia="title">Replaced Head</title>', '<meta data-inertia="description" name="description" content="Replaced description">'])}>Replace head client-side</button>
  <Link href={props.next}>Next server head page</Link>
</div>
