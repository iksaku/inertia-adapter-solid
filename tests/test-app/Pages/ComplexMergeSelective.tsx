import { router } from 'inertia-adapter-solid'

export default function Merge(props: {
  mixed: {
    name: string
    users: string[]
    chat: { data: number[] }
    post: { id: number; comments: { allowed: boolean; data: string[] } }
  }
}) {
  return (
    <div>
      <div>name is {props.mixed.name}</div>
      <div>users: {props.mixed.users.join(', ')}</div>
      <div>chat.data: {props.mixed.chat.data.join(', ')}</div>
      <div>post.id: {props.mixed.post.id}</div>
      <div>post.comments.allowed: {props.mixed.post.comments.allowed ? 'true' : 'false'}</div>
      <div>post.comments.data: {props.mixed.post.comments.data.join(', ')}</div>
      <button onClick={() => router.reload({ only: ['mixed'] })}>Reload</button>
    </div>
  )
}
