export default function SharedLayout(props) {
  const rand = Math.random()

  return (
    <ul>
      <li>
        Shared Layout: {rand}
        {props.children}
      </li>
    </ul>
  )
}
