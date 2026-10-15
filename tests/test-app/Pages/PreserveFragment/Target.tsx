import { usePage } from 'inertia-adapter-solid'
export default () => {
  const page = usePage()
  return (
    <div>
      <span id="current-url">{page.url}</span>
      <span id="target-text">This is the target page</span>
    </div>
  )
}
