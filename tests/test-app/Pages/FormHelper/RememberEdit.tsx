import { useForm } from 'inertia-adapter-solid'
interface User {
  id: number
  name: string
  email: string
}
export default (props1: {
  user: User
}) => {
  const form = useForm('EditUserForm', {
    name: props1.user!.name,
    email: props1.user!.email,
  })
  return (
    <div>
      <h1>Edit User {props1.user!.id}</h1>
      <form>
        <div>
          <label>Name:</label>
          <input type="text" value={form.data.name} onInput={(e) => form.setData('name', e.currentTarget.value)} />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" value={form.data.email} onInput={(e) => form.setData('email', e.currentTarget.value)} />
        </div>
      </form>
    </div>
  )
}
