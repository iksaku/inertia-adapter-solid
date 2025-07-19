import MainLayout from '@/Components/MainLayout'
import SharedLayout from '@/Components/SharedLayout'

export default function PageD() {
  const rand = Math.random()

  return 'Page D'
}

function LayoutD(props) {
  const rand = Math.random()

  return (
    <ul>
      <li>
        Layout D: {rand}
        <ul>
          <li>{props.children}</li>
        </ul>
      </li>
    </ul>
  )
}

PageD.layout = [MainLayout, SharedLayout, LayoutD]
