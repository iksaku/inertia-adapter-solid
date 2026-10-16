import { Head } from 'inertia-adapter-solid'
import { createSignal, onMount } from 'solid-js'

export default function RawText() {
  const [updated, setUpdated] = createSignal(false)
  const [mounted, setMounted] = createSignal(false)
  const value = () => (updated() ? 'C > D & "changed"' : 'A & < B "quoted"')
  const structuredData = () => JSON.stringify({ '@type': 'WebPage', name: value() })
  const script = () =>
    `document.documentElement.dataset.headScriptRuns = String(Number(document.documentElement.dataset.headScriptRuns || 0) + 1);document.documentElement.dataset.headScriptValue = ${JSON.stringify(value())};`
  onMount(() => setMounted(true))
  return (
    <>
      <Head>
        <script type="application/ld+json" head-key="structured-data">
          {structuredData()}
        </script>
        <script type="application/ld+json" head-key="structured-data-raw" innerHTML={structuredData()} />
        <style head-key="stylesheet">
          {updated() ? ':root { --head-raw-text: "C > D &"; }' : ':root { --head-raw-text: "A & < B"; }'}
        </style>
        <script head-key="executable">{script()}</script>
      </Head>
      <output data-testid="head-mounted">{mounted() ? 'mounted' : 'server'}</output>
      <button type="button" onClick={() => setUpdated(true)}>
        Update raw head content
      </button>
    </>
  )
}
