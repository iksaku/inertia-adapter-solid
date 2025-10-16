import MainLayout from '@/Components/MainLayout'
import usePoll from '../../src/usePoll'

export default function UsePoll(props) {
  const { start, stop } = usePoll({ interval: 5_000 })

  return <div>Date: {props.now}</div>
}

UsePoll.layout = MainLayout
