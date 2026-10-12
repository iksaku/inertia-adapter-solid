import { Deferred, router, usePage } from 'inertia-adapter-solid'
export default function WithReload() {
  const page = usePage<{ results?: { data: string[]; page: number } }>()
  return (
    <>
      <Deferred data="results" fallback={<div>Loading results...</div>}>
        <div id="results-data">{page.props.results?.data?.join(', ')}</div>
        <div id="results-page">Page: {page.props.results?.page}</div>
      </Deferred>
      <button onClick={() => router.reload({ data: { page: 2 } })}>Reload with page 2</button>
    </>
  )
}
