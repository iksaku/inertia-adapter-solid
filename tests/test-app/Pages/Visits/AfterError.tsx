import { router } from 'inertia-adapter-solid'
export default () => {
  const visitDump = (e: MouseEvent) => {
    e.preventDefault()
    router.visit('/dump/get')
  }
  const throwErrorOnSuccess = (e: MouseEvent) => {
    e.preventDefault()
    router.visit('/visits/after-error/2', {
      onSuccess: () => {
        throw new Error('Error after visit')
      },
    })
  }
  return (
    <div>
      <a href="#" onClick={visitDump}>
        Visit dump page
      </a>

      <a href="#" onClick={throwErrorOnSuccess}>
        Throw error on success
      </a>
    </div>
  )
}
