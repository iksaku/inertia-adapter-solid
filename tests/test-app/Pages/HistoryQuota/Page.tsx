import { For } from 'solid-js'
import { Link } from 'inertia-adapter-solid'
export default (props0: {
  pageNumber: number
  largeData: string
}) => {
  return (
    <div>
      <h1>History Quota Test - Page {props0.pageNumber}</h1>
      <p>Data size: {props0.largeData?.length?.toLocaleString()} bytes</p>

      <div style={{ 'margin-top': '20px' }}>
        {
          <For each={Array.from({ length: 20 }, (_, i) => i + 1)}>
            {(n) => (
              <Link href={`/history-quota/${n}`} style={{ 'margin-right': '10px' }}>
                Page {n}
              </Link>
            )}
          </For>
        }
        <Link href="/history-quota/deferred">Deferred</Link>
      </div>

      <div style={{ height: '5000px' }}></div>
    </div>
  )
}
