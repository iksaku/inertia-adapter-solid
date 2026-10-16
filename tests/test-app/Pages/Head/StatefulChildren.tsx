import { Head } from 'inertia-adapter-solid'
import { For, Show, createSignal } from 'solid-js'

export default function StatefulChildren() {
  const first = { name: 'first' }
  const second = { name: 'second' }
  const third = { name: 'third' }
  const [items, setItems] = createSignal([first, second])
  const [suffix, setSuffix] = createSignal('before')
  const [visible, setVisible] = createSignal(true)
  let nextId = 0
  const StatefulMeta = (props: { name: string }) => {
    const [id] = createSignal(++nextId)
    return <meta name={props.name} content={`${id()}:${suffix()}`} head-key={props.name} />
  }
  return (
    <>
      <Show when={visible()}>
        <Head>
          <For each={items()}>{(item) => <StatefulMeta name={item.name} />}</For>
        </Head>
      </Show>
      <button
        type="button"
        onClick={() => {
          setItems([second, first, third])
          setSuffix('after')
        }}
      >
        Reorder and add
      </button>
      <button type="button" onClick={() => setItems([third, first])}>
        Remove second
      </button>
      <button type="button" onClick={() => setVisible(false)}>
        Remove Head
      </button>
    </>
  )
}
