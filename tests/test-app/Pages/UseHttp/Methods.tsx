import { createSignal } from 'solid-js'
import { useHttp } from 'inertia-adapter-solid'
interface UserResponse {
  success: boolean
  id: number
  user: {
    name: string
    email: string
  }
}
export default () => {
  const updateUser = useHttp<
    {
      name: string
      email: string
    },
    UserResponse
  >({
    name: '',
    email: '',
  })
  const [lastPutResponse, setLastPutResponse] = createSignal<UserResponse | null>(null)
  const [lastPatchResponse, setLastPatchResponse] = createSignal<UserResponse | null>(null)
  const performPut = async () => {
    try {
      const result = await updateUser.put('/api/users/1')
      setLastPutResponse(result ?? null)
    } catch (e) {
      console.error('PUT failed:', e)
    }
  }
  const performPatch = async () => {
    try {
      const result = await updateUser.patch('/api/users/1')
      setLastPatchResponse(result ?? null)
    } catch (e) {
      console.error('PATCH failed:', e)
    }
  }
  return (
    <div>
      <h1>useHttp Methods Test</h1>

      {/* PUT Request Test */}
      <section id="put-test">
        <h2>PUT Request</h2>
        <label>
          Name
          <input
            type="text"
            id="put-name"
            value={updateUser.data.name}
            onInput={(e) => updateUser.setData('name', e.currentTarget.value)}
          />
        </label>
        <label>
          Email
          <input
            type="email"
            id="put-email"
            value={updateUser.data.email}
            onInput={(e) => updateUser.setData('email', e.currentTarget.value)}
          />
        </label>
        <button onClick={performPut} id="put-button">
          Update User (PUT)
        </button>
        {updateUser.processing && <div id="put-processing">Updating...</div>}
        {lastPutResponse() && (
          <div id="put-result">
            PUT Success - ID: {lastPutResponse()!.id}, Name: {lastPutResponse()!.user.name}, Email:{' '}
            {lastPutResponse()!.user.email}
          </div>
        )}
      </section>

      {/* PATCH Request Test */}
      <section id="patch-test">
        <h2>PATCH Request</h2>
        <button onClick={performPatch} id="patch-button">
          Update User (PATCH)
        </button>
        {lastPatchResponse() && (
          <div id="patch-result">
            PATCH Success - ID: {lastPatchResponse()!.id}, Name: {lastPatchResponse()!.user.name}, Email:{' '}
            {lastPatchResponse()!.user.email}
          </div>
        )}
      </section>
    </div>
  )
}
