import { router, usePage } from 'inertia-adapter-solid'
export default () => {
  const reactiveProps0Page = usePage<{
      data: {
        items: {
          id: number
          name: string
        }[]
        label: string
      }
    }>(),
    reactiveProps0 = () => reactiveProps0Page.props
  const loadMore = () => {
    router.reload({
      only: ['data'],
      data: { page: 2 },
    })
  }
  return (
    <>
      <p id="items">
        {reactiveProps0()
          .data.items.map((i) => i.name)
          .join(', ')}
      </p>
      <p id="label">Label: {reactiveProps0().data.label}</p>
      <button onClick={loadMore}>Load More</button>
    </>
  )
}
