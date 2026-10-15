import { createSignal, onMount } from 'solid-js'
import { useHttp } from 'inertia-adapter-solid'
interface SearchResponse {
  items: string[]
  total: number
  query: string | null
}
export default () => {
  const http = useHttp<
    {
      query: string
    },
    SearchResponse
  >({ query: '' })
  let renderCount = 0
  const [result, setResult] = createSignal<SearchResponse | null>(null)
  renderCount++
  const { get } = http
  const fetchData = async () => {
    try {
      const data = await get('/api/data')
      setResult(data ?? null)
    } catch {
      // ignore
    }
  }
  onMount(() => {
    fetchData()
  })
  return (
    <div>
      <h1>useHttp Stable Reference Test</h1>
      <div id="render-count">Render count: {renderCount}</div>
      {http.recentlySuccessful && <div id="recently-successful">Recently successful</div>}
      {result() && <div id="result">Items: {result()!.items.join(', ')}</div>}
    </div>
  )
}
