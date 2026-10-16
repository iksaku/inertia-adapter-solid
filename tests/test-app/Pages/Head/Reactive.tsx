import { Head } from 'inertia-adapter-solid'
import { createSignal } from 'solid-js'
export default function Reactive() {
  const [title, setTitle] = createSignal('Initial Title')
  const [description, setDescription] = createSignal('Initial description')
  return (
    <>
      <Head title={title()}>
        <meta name="description" content={description()} head-key="description" />
        <meta name="author" content="Test Author" />
      </Head>
      <h1>Dynamic Head Updates</h1>
      <button
        id="update-meta"
        onClick={() => {
          setTitle('Updated Title')
          setDescription('Updated description')
        }}
      >
        Update Meta
      </button>
      <p>Current title: {title()}</p>
      <p>Current description: {description()}</p>
    </>
  )
}
