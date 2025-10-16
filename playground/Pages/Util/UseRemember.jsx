import MainLayout from '@/Components/MainLayout'
import { router, useRemember } from 'inertia-adapter-solid'

export default function UseRemember() {
  const [value, setValue] = useRemember('')

  return (
    <>
      <div>Test for useRemember:</div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          router.visit('/')
        }}
      >
        <input type="text" placeholder="Type symething..." value={value()} onInput={(e) => setValue(e.target.value)} />

        <button type="submit">Go to Home</button>
      </form>
      <p>
        To test this feature, type something in the box and hit "Go to Home".
        <br />
        This will take you to the Playground home page, from which you can "navigate back" using your browsers' own
        history function.
        <br />
        After this second navigation, you should be able to see the contents of what you typed in the box to be the
        same.
      </p>
    </>
  )
}

UseRemember.layout = MainLayout
