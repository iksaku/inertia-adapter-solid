import MainLayout from '@/Components/MainLayout'

export default function PageB() {
  const rand = Math.random()

  return 'Page B'
}

function LayoutB(props) {
  const rand = Math.random()

  return (
    <ul>
      <li>
        Layout B: {rand}
        <ul>
          <li>{props.children}</li>
        </ul>
      </li>
    </ul>
  )
}

PageB.layout = [MainLayout, LayoutB]
