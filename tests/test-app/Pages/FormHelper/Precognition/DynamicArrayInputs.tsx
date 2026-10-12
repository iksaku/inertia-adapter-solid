import { Index } from 'solid-js'
import { useForm } from 'inertia-adapter-solid'
export default () => {
  const form = useForm({
    items: [] as Array<{
      name: string
    }>,
  })
    .withPrecognition('post', '/precognition/dynamic-array-inputs')
    .setValidationTimeout(100)
  function addItem() {
    form.setData('items', [...form.data.items, { name: '' }])
  }
  function updateItem(index: number, value: string) {
    const items = [...form.data.items]
    items[index] = { name: value }
    form.setData('items', items)
  }
  return (
    <div>
      <button id="add-item" onClick={addItem}>
        Add Item
      </button>

      {
        <Index each={form.data.items}>
          {(item, idx) => (
            <div>
              <input
                value={item()!.name}
                name={`items.${idx}.name`}
                onInput={(e) => updateItem(idx, e.currentTarget.value)}
                onBlur={() => form.validate(`items.${idx}.name`)}
              />
              {form.invalid(`items.${idx}.name`) && (
                <p id={`items.${idx}.name-error`}>{form.errors[`items.${idx}.name`]}</p>
              )}
              {form.valid(`items.${idx}.name`) && <p>Valid!</p>}
            </div>
          )}
        </Index>
      }

      {form.validating && <p>Validating...</p>}
    </div>
  )
}
