import { Meta, Title } from '@solidjs/meta'
import { createSignal, Show } from 'solid-js'
export default function Conditional() {
  const [description, setDescription] = createSignal(true)
  const [keywords, setKeywords] = createSignal(false)
  return <><Title>Conditional Rendering</Title>
    <Show when={description()}><Meta name="description" content="This description is conditionally rendered" /></Show>
    <Show when={keywords()}><Meta name="keywords" content="vue, test, conditional" /></Show>
    <Meta name="always-present" content="This is always here" />
    <h1>Conditional Head Rendering</h1>
    <button id="toggle-description" onClick={() => setDescription((v) => !v)}>{description() ? 'Hide' : 'Show'} Description</button>
    <button id="toggle-keywords" onClick={() => setKeywords((v) => !v)}>{keywords() ? 'Hide' : 'Show'} Keywords</button>
    <p>Description visible: {String(description())}</p><p>Keywords visible: {String(keywords())}</p>
  </>
}
