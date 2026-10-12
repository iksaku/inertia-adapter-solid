import { router, usePage } from 'inertia-adapter-solid'
export default () => {
  const reactiveProps0Page = usePage<{
      feed: {
        posts: {
          id: number
          title: string
        }[]
        meta: {
          page: number
        }
      }
    }>(),
    reactiveProps0 = () => reactiveProps0Page.props
  const loadMore = () => {
    router.reload({
      only: ['feed'],
      data: { page: reactiveProps0().feed.meta.page + 1 },
    })
  }
  return (
    <>
      <p id="posts">
        {reactiveProps0()
          .feed.posts.map((p) => p.title)
          .join(', ')}
      </p>
      <p id="meta">Page: {reactiveProps0().feed.meta.page}</p>
      <button onClick={loadMore}>Load More</button>
    </>
  )
}
