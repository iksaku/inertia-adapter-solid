import { createSignal, Index } from 'solid-js'
import { Form } from 'inertia-adapter-solid'
export default () => {
  const [items, setItems] = createSignal<
    Array<{
      name: string
    }>
  >([])
  function addItem() {
    setItems([...items(), { name: '' }])
  }
  function updateItem(index: number, value: string) {
    const newItems = [...items()]
    newItems[index] = { name: value }
    setItems(newItems)
  }
  return (
    <div>
      <button id="add-item" onClick={addItem}>
        Add Item
      </button>

      <Form action="/precognition/dynamic-array-inputs" method="post" validationTimeout={100}>
        {(props1) => (
          <>
            {
              <Index each={items()!}>
                {(item, idx) => (
                  <div>
                    <input
                      value={item()!.name}
                      name={`items.${idx}.name`}
                      onInput={(e) => updateItem(idx, e.currentTarget.value)}
                      onBlur={() => props1.validate(`items.${idx}.name`)}
                    />
                    {props1.invalid(`items.${idx}.name`) && (
                      <p id={`items.${idx}.name-error`}>{props1.errors[`items.${idx}.name`]}</p>
                    )}
                  </div>
                )}
              </Index>
            }

            {props1.validating && <p>Validating...</p>}
          </>
        )}
      </Form>
    </div>
  )
}
