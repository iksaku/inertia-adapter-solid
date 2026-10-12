import { Title } from '@solidjs/meta'
import { Link, router } from 'inertia-adapter-solid'
// Solid explicitly excludes the createInertiaApp title callback contract.
export default (props: { titleSuffix?: string }) => <><Title>Callback Page</Title><h1>Title Callback Page</h1><Link href="/head/reactive">Go to reactive</Link><button onClick={() => router.replaceProp('titleSuffix', 'replaced')}>Replace prop</button><p>Current suffix: {props.titleSuffix ?? 'none'}</p></>
