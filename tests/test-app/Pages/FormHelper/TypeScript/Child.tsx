// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import type { InertiaFormProps } from 'inertia-adapter-solid'
import type { FormDataConvertible } from '@inertiajs/core'
export default function Child<
  T extends Record<string, FormDataConvertible> & { name: string; email?: string },
>(props1: { form: InertiaFormProps<T> }) {
  return (
    <div>
      <p>Name: {props1.form!.data.name}</p>
      <p>Email: {props1.form!.data.email}</p>
    </div>
  )
}
