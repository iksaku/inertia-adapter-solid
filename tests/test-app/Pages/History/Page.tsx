import { Link, router } from 'inertia-adapter-solid'
export default (props0: {
  pageNumber: string
  multiByte: string
}) => {
  const clearHistory = () => {
    router.clearHistory()
  }
  return (
    <>
      <Link href="/history/1">Page 1</Link>
      <Link href="/history/2">Page 2</Link>
      <Link href="/history/3">Page 3</Link>
      <Link href="/history/4">Page 4</Link>
      <Link href="/history/5">Page 5</Link>

      <button onClick={clearHistory}>Clear History</button>

      <div>This is page {props0.pageNumber}.</div>
      <div>Multi byte character: {props0.multiByte}</div>

      <div style={{ height: '5000px' }}></div>
    </>
  )
}
