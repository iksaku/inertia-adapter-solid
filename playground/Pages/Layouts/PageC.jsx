import MainLayout from '@/Components/MainLayout'
import SharedLayout from '@/Components/SharedLayout'

export default function PageC() {
  const rand = Math.random()

  return 'Page C'
}

function LayoutC(props) {
  const rand = Math.random()

  return (
    <ul>
      <li>
        Layout C: {rand}
        <ul>
          <li>{props.children}</li>
        </ul>
      </li>
    </ul>
  )
}

PageC.layout = [MainLayout, SharedLayout, LayoutC]
