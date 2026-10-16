import { Head } from 'inertia-adapter-solid'
import { Show, createSignal } from 'solid-js'

export default function Providers() {
  const [layoutTitle, setLayoutTitle] = createSignal('Layout title')
  const [layoutVisible, setLayoutVisible] = createSignal(true)
  const [pageVisible, setPageVisible] = createSignal(true)
  return (
    <>
      <Show when={layoutVisible()}>
        <Head title={layoutTitle()}>
          <meta name="description" head-key="description" content={layoutTitle()} />
          <meta name="layout-revision" content={layoutTitle()} />
        </Head>
      </Show>
      <Show when={pageVisible()}>
        <Head title="Page title">
          <meta name="description" head-key="description" content="Page description" />
        </Head>
      </Show>
      <button type="button" onClick={() => setLayoutTitle('Updated layout title')}>
        Update layout head
      </button>
      <button type="button" onClick={() => setPageVisible(false)}>
        Remove page head
      </button>
      <button type="button" onClick={() => setLayoutVisible(false)}>
        Remove layout head
      </button>
    </>
  )
}
