import MainLayout from "@/Components/MainLayout";

export default function PageA() {
  const rand = Math.random()

  return 'Page A'
}

function LayoutA(props) {
  const rand = Math.random()

  return (
    <ul>
      <li>
        Layout A: {rand}
        <ul>
          <li>{props.children}</li>
        </ul>
      </li>
    </ul>
  )
}

PageA.layout = [MainLayout, LayoutA]