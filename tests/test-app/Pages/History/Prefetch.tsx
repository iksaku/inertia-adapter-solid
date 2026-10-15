import { Link } from 'inertia-adapter-solid'
export default (props0: {
  page: string
  loadedAt: number
}) => {
  return (
    <>
      <Link href="/history/prefetch/dashboard" prefetch cacheFor="1m">
        Dashboard
      </Link>
      <Link href="/history/prefetch/reports" prefetch cacheFor="1m">
        Reports
      </Link>
      <Link href="/history/prefetch/signed-out">Sign out</Link>

      <div>This is the {props0.page} page.</div>
      <div>Loaded at: {props0.loadedAt}</div>
    </>
  )
}
