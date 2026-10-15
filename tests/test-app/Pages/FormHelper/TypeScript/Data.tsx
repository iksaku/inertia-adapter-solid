// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import { useForm } from 'inertia-adapter-solid'
type FormData = {
  name: string
  company: {
    name: string
  }
  users: {
    name: string
  }[]
}
const defaultData = {
  name: '',
  company: { name: '' },
  users: [],
}
export default function Data() {
  const form = useForm<FormData>(defaultData)
  form.setData('name', 'John Doe')
  form.setData('company', 'name', 'Acme Corp')
  form.setData('users', [{ name: 'Jane Doe' }])
  // @ts-expect-error - A form has no email field
  form.setData('email', 'john@example.com')
  // @ts-expect-error - A company has no street field
  form.setData('company', 'street', '123 Main St')
  // @ts-expect-error - A company has no street field
  form.setData('company', { name: 'Acme Corp', street: '123 Main St' })
  // @ts-expect-error - A form has no email field
  form.setData('users', [{ name: 'Jane Doe', email: 'jane@example.com' }])
  return null
}
