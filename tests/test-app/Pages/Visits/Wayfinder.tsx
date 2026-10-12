import { router } from 'inertia-adapter-solid'
export default function Wayfinder() {
  const wayfinderObjectVisit = (e: MouseEvent) => {
    e.preventDefault()
    router.visit({ url: '/dump/post', method: 'post' })
  }
  const wayfinderObjectMethodOverride = (e: MouseEvent) => {
    e.preventDefault()
    router.visit({ url: '/dump/patch', method: 'get' }, { method: 'patch' })
  }
  return (
    <div>
      <a href="#" onClick={wayfinderObjectVisit} class="wayfinder-visit">
        Wayfinder object visit
      </a>
      <a href="#" onClick={wayfinderObjectMethodOverride} class="wayfinder-method-override">
        Wayfinder object method override
      </a>
    </div>
  )
}
