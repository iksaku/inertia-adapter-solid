import { Head, Link, router } from 'inertia-adapter-solid'
import { Show } from 'solid-js'
export default (props: { foo: string; next: string }) => (
  <div>
    <Show when={new URLSearchParams(window.location.search).has('override')}>
      <Head>
        <meta head-key="description" name="description" content="Page override" />
      </Head>
    </Show>
    <h1>Server Head</h1>
    <p id="foo">{props.foo}</p>
    <button onClick={() => router.reload({ only: ['foo'] })}>Reload foo</button>
    <button
      onClick={() =>
        router.replaceProp('head', [
          '<title data-inertia="title">Replaced Head</title>',
          '<meta data-inertia="description" name="description" content="Replaced description">',
        ])
      }
    >
      Replace head client-side
    </button>
    <Link href={props.next}>Next server head page</Link>
  </div>
)
