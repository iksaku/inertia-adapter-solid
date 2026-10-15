import { Meta, Title } from '@solidjs/meta'
import { createSignal } from 'solid-js'
export default function Reactive() {
  const [title, setTitle] = createSignal('Initial Title')
  const [description, setDescription] = createSignal('Initial description')
  return <><Title>{title()}</Title><Meta name="description" content={description()} /><Meta name="author" content="Test Author" />
    <h1>Dynamic Head Updates</h1><button id="update-meta" onClick={() => { setTitle('Updated Title'); setDescription('Updated description') }}>Update Meta</button>
    <p>Current title: {title()}</p><p>Current description: {description()}</p>
  </>
}
