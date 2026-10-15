import { router } from 'inertia-adapter-solid'
export default () => {
  const locationVisit = (e: MouseEvent) => {
    e.preventDefault()
    router.visit('/location')
  }
  return (
    <div>
      <span class="text">This is the page that demonstrates location visits</span>

      <a href="#" onClick={locationVisit} class="example">
        Location visit
      </a>
    </div>
  )
}
