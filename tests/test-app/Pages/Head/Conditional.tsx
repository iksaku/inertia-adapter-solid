import { Head } from 'inertia-adapter-solid'
import { createSignal, Show } from 'solid-js'
export default function Conditional() {
  const [description, setDescription] = createSignal(true)
  const [keywords, setKeywords] = createSignal(false)
  return (
    <>
      <Head title="Conditional Rendering">
        <Show when={description()}>
          <meta name="description" content="This description is conditionally rendered" head-key="description" />
        </Show>
        <Show when={keywords()}>
          <meta name="keywords" content="vue, test, conditional" head-key="keywords" />
        </Show>
        <meta name="always-present" content="This is always here" />
      </Head>
      <h1>Conditional Head Rendering</h1>
      <button id="toggle-description" onClick={() => setDescription((v) => !v)}>
        {description() ? 'Hide' : 'Show'} Description
      </button>
      <button id="toggle-keywords" onClick={() => setKeywords((v) => !v)}>
        {keywords() ? 'Hide' : 'Show'} Keywords
      </button>
      <p>Description visible: {String(description())}</p>
      <p>Keywords visible: {String(keywords())}</p>
    </>
  )
}
