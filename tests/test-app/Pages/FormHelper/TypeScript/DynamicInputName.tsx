// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import { useForm } from 'inertia-adapter-solid'
interface ClientForm {
  name: string
  [key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
}
export default function DynamicInputName() {
  const formState1 = useForm<ClientForm>({
    name: '',
  })
  const handleChange = (
    e: Event & {
      currentTarget: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    },
  ) => {
    const { name, value } = e.currentTarget as HTMLInputElement
    formState1.setData(name, value)
  }
  return <input name="name" type="text" value={formState1.data!.name} onInput={handleChange} />
}
