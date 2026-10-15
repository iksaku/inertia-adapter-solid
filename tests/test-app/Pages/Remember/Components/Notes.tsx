import { useRemember } from 'inertia-adapter-solid'
export default () => {
  const [notes, setNotes] = useRemember('', 'Users/Notes')
  return (
    <label>
      Notes
      <input type="text" value={notes()} onInput={(e) => setNotes(e.target.value)} />
    </label>
  )
}
