import { Head } from 'inertia-adapter-solid'
import { Show, createSignal } from 'solid-js'

export default function EscapedKey() {
  const [content, setContent] = createSignal('First & "quoted" <value>')
  const [visible, setVisible] = createSignal(true)
  return (
    <>
      <Head>
        <meta name="escaped-key" head-key={'description" & <page>'} content="Fallback description" />
      </Head>
      <Show when={visible()}>
        <Head>
          <meta name="escaped-key" head-key={'description" & <page>'} content={content()} />
        </Head>
      </Show>
      <button type="button" onClick={() => setContent('Second > value & "changed"')}>
        Update keyed metadata
      </button>
      <button type="button" onClick={() => setVisible(false)}>
        Remove keyed metadata
      </button>
    </>
  )
}
