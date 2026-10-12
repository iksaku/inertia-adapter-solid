// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import { useForm } from 'inertia-adapter-solid'
interface LoginData {
  username: string
  password: string
  remember: boolean
}
export default function OptionalProps(props1: {
  user?: {
    username: string
  }
}) {
  useForm<LoginData>({
    username: props1.user!?.username ?? '',
    password: '',
    remember: true,
  })
}
