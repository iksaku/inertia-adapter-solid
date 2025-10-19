import MainLayout from '@/Components/MainLayout'
import { unwrap } from 'solid-js/store'
import { Form } from '../../../src'

export default function FormTest(props) {
  return (
    <>
      <Form action={{ url: '/components/form', method: 'post' }}>
        <div>
          <label for="name">Enter your Name</label>
          <input id="name" type="text" name="name" value={props.name ?? ''} />
        </div>

        <div>
          <input id="accept" type="checkbox" name="accept" checked={props.accept} />
          <label for="accept">Accept (imaginary) terms and conditions</label>
        </div>

        <div>
          <span>Choose your favorite season</span>
          <div>
            <input
              id="sping"
              type="radio"
              name="favorite_season"
              value="spring"
              checked={props.favorite_season === 'spring'}
            />
            <label for="sping">Sping</label>
          </div>
          <div>
            <input
              id="summer"
              type="radio"
              name="favorite_season"
              value="summer"
              checked={props.favorite_season === 'summer'}
            />
            <label for="summer">Summer</label>
          </div>
          <div>
            <input
              id="fall"
              type="radio"
              name="favorite_season"
              value="fall"
              checked={props.favorite_season === 'fall'}
            />
            <label for="fall">Fall</label>
          </div>
          <div>
            <input
              id="winter"
              type="radio"
              name="favorite_season"
              value="winter"
              checked={props.favorite_season === 'winter'}
            />
            <label for="winter">Winter</label>
          </div>
        </div>

        <button type="submit">Submit</button>
      </Form>

      <div>Old Data: {JSON.stringify(props)}</div>
    </>
  )
}

FormTest.layout = MainLayout
