export interface User {
  id: number
  name: string
}
export default function UserCard(props: { user: User }) {
  return (
    <div
      data-user-id={props.user.id}
      style={{
        height: '15vh',
        border: '1px solid #ccc',
        'background-color': `rgba(150,150,150,${props.user.id / 40})`,
        color: 'green',
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
      }}
    >
      {props.user.name}
    </div>
  )
}
