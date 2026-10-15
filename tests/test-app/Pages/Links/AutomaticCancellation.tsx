import { Link } from 'inertia-adapter-solid'
export default () => {
  return (
    <div>
      <span class="text">This is the links page that demonstrates that only one visit can be active at a time</span>
      <Link
        href="/sleep"
        class="visit"
        onCancel={() => console.log('cancelled')}
        onStart={() => console.log('started')}
      >
        Link
      </Link>
    </div>
  )
}
