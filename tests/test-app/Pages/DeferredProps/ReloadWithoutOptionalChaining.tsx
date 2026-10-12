import { Deferred, router, usePage } from 'inertia-adapter-solid'
const Results = () => {
  const page = usePage<{ results: { data: string[]; page: number } }>()
  return (
    <>
      <div id="results-data">{page.props.results.data.join(', ')}</div>
      <div id="results-page">Page: {page.props.results.page}</div>
    </>
  )
}
export default function WithReload() {
  return (
    <>
      <Deferred data="results" fallback={<div>Loading results...</div>}>
        <Results />
      </Deferred>
      <button onClick={() => router.reload({ data: { page: 2 } })}>Reload with page 2</button>
    </>
  )
}
