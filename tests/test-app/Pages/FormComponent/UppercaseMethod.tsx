import { Form } from 'inertia-adapter-solid'
export default () => {
  return (
    <div>
      <h1>Uppercase Method Test</h1>

      {/* Test with uppercase POST */}
      <Form action="/dump/post" method="POST">
        <div>
          <input type="text" name="name" placeholder="Name" value="Test POST" />
        </div>
        <button type="submit">Submit POST</button>
      </Form>

      {/* Test with uppercase GET */}
      <Form action="/dump/get" method="GET">
        <div>
          <input type="text" name="query" placeholder="Query" value="Test GET" />
        </div>
        <button type="submit">Submit GET</button>
      </Form>

      {/* Test with uppercase PUT */}
      <Form action="/dump/put" method="PUT">
        <div>
          <input type="text" name="data" placeholder="Data" value="Test PUT" />
        </div>
        <button type="submit">Submit PUT</button>
      </Form>

      {/* Test with uppercase PATCH */}
      <Form action="/dump/patch" method="PATCH">
        <div>
          <input type="text" name="changes" placeholder="Changes" value="Test PATCH" />
        </div>
        <button type="submit">Submit PATCH</button>
      </Form>

      {/* Test with uppercase DELETE */}
      <Form action="/dump/delete" method="DELETE">
        <div>
          <input type="text" name="reason" placeholder="Reason" value="Test DELETE" />
        </div>
        <button type="submit">Submit DELETE</button>
      </Form>
    </div>
  )
}
