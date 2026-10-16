import { Head, Link, router } from 'inertia-adapter-solid'
import { Show, createSignal } from 'solid-js'

// The app's title callback reads this Signal independently of the page's Head.
export const [alternateSuffix, setAlternateSuffix] = createSignal('Alternate')

export default (props: { titleSuffix?: string }) => {
  const [title, setTitle] = createSignal('Callback Page')
  const [visible, setVisible] = createSignal(true)
  return (
    <>
      <Show when={visible()}>
        <Head>
          <title>{title()}</title>
        </Head>
      </Show>
      <h1>Title Callback Page</h1>
      <Link href="/head/reactive">Go to reactive</Link>
      <button type="button" onClick={() => router.replaceProp('titleSuffix', 'replaced')}>
        Replace prop
      </button>
      <button type="button" onClick={() => setTitle('Third')}>
        Change title branch
      </button>
      <button type="button" onClick={() => setAlternateSuffix('Updated')}>
        Update callback suffix
      </button>
      <button type="button" onClick={() => setVisible(false)}>
        Remove Head
      </button>
      <p>Current suffix: {props.titleSuffix ?? 'none'}</p>
    </>
  )
}
