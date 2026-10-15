// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import type { FormDataConvertible } from '@inertiajs/core'
import type { InertiaFormProps } from 'inertia-adapter-solid'
interface GenericProps<TFormData extends Record<string, FormDataConvertible>> {
  form: InertiaFormProps<TFormData>
}
export default function Generic<TFormData extends Record<string, FormDataConvertible>>(
  props1: GenericProps<TFormData>,
) {
  console.log(props1.form)
  return <div>{/* Generic form component */}</div>
}
