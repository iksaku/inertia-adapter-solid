import MainLayout from '@/Components/MainLayout'
import { usePoll } from 'inertia-adapter-solid'

export default function UsePoll(props) {
  const { start, stop } = usePoll(5_000)

  return <div>Date: {props.now}</div>
}

UsePoll.layout = MainLayout
