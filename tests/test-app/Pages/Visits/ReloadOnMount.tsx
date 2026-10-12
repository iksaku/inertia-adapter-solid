import { onMount } from 'solid-js'
import { router } from 'inertia-adapter-solid'
export default (props: {
  name: string
}) => {
  onMount(() => {
    router.reload({ only: ['name'] })
  })
  return <div>Name is {props.name}</div>
}
