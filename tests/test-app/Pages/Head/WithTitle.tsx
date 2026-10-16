import { Head } from 'inertia-adapter-solid'
import { Show, createSignal } from 'solid-js'

export default function WithTitle(props: { titleMode?: string }) {
  const [title, setTitle] = createSignal(props.titleMode === 'empty-prop' ? '' : 'Title from Prop & <fallback>')
  const [child, setChild] = createSignal<string | undefined>(
    props.titleMode === 'empty-prop' ? undefined : props.titleMode === 'empty-child' ? '' : 'Title from Children',
  )
  return (
    <>
      <Head title={title()}>
        <Show when={child() !== undefined}>
          <title>{child()}</title>
        </Show>
        <meta name="description" content="Title set via children, not prop" />
      </Head>
      <h1>Title in Children</h1>
      <button type="button" onClick={() => setChild('')}>
        Empty child title
      </button>
      <button type="button" onClick={() => setChild(undefined)}>
        Remove child title
      </button>
      <button type="button" onClick={() => setTitle('')}>
        Clear title prop
      </button>
    </>
  )
}
