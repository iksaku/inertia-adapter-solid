import { Head } from 'inertia-adapter-solid'
import { Show, createSignal } from 'solid-js'

export default function HeadTitle() {
  const [title, setTitle] = createSignal('SSR Head Title')
  const [description, setDescription] = createSignal('Initial SSR description')
  const [visible, setVisible] = createSignal(true)
  return (
    <>
      <Show when={visible()}>
        <Head title={title()}>
          <meta name="description" content={description()} head-key="description" />
        </Head>
      </Show>
      <p>SSR head title test</p>
      <button
        onClick={() => {
          setTitle('Updated SSR Title')
          setDescription('Updated SSR description')
        }}
      >
        Update head
      </button>
      <button onClick={() => setVisible((value) => !value)}>Toggle head</button>
    </>
  )
}
