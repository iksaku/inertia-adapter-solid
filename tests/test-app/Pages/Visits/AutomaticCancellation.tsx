import { router } from 'inertia-adapter-solid'
export default () => {
  const visit = (e: MouseEvent) => {
    e.preventDefault()
    router.get(
      '/sleep',
      {},
      {
        onStart: () => console.log('started'),
        onCancel: () => console.log('cancelled'),
      },
    )
  }
  return (
    <div>
      <span class="text">This is the page that demonstrates that only one visit can be active at a time</span>
      <a href="#" onClick={visit} class="visit">
        Link
      </a>
    </div>
  )
}
