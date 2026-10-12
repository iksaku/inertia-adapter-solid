import { mergeProps } from 'solid-js'
import { router } from 'inertia-adapter-solid'
export default (props0Input: {
  foo?: string
  bar?: string
}) => {
  const props0 = mergeProps({ foo: '', bar: '' }, props0Input)
  const replaceSequentially = () => {
    router.replaceProp('foo', 'baz')
    router.replaceProp('bar', 'qux')
  }
  return (
    <div>
      <p>Foo: {props0.foo}</p>
      <p>Bar: {props0.bar}</p>

      <button onClick={replaceSequentially}>Replace foo and bar sequentially</button>
    </div>
  )
}
