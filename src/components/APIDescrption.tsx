import { FC } from 'hono/jsx'

export const APIDescription: FC = () => {
  return (
    <div>
      <h2>API</h2>

      <h3>Store JSON record</h3>

      <p>
        <strong>POST</strong>: <code>/r</code>
      </p>

      <p>
        <strong>Headers</strong>:
        <ul>
          <li>Content-Type: application/json</li>
          <li>
            X-Access-Key: &lt;access-key&gt; (optional, if not specific, a
            random one will be generated for your and returned along with the
            response header.)
          </li>
        </ul>
      </p>

      <p>
        <strong>Response</strong>:
        <pre>
          <code>
            {`// headers
X-Access-Key: <access-key>

// body
{
  "record": {
    "sample": "Hello World"
  },
  "metadata": {
    "id": "<Record Id>",
    "createdAt": "<Date & Time>",
    "updatedAt": "<Date & Time>"
  }
}`}
          </code>
        </pre>
      </p>

      <h3>Retrieve JSON record</h3>

      <p>
        <strong>GET</strong>: <code>/r/:id</code>
      </p>

      <p>
        <strong>Headers</strong>:
        <ul>
          <li>Content-Type: application/json</li>
          <li>X-Access-Key: &lt;access-key&gt; (required)</li>
        </ul>
      </p>

      <p>
        <strong>Response</strong>:
        <pre>
          <code>
            {`{
  "record": {
    "sample": "Hello World"
  },
  "metadata": {
    "id": "<Record Id>",
    "createdAt": "<Date & Time>",
    "updatedAt": "<Date & Time>"
  }
}`}
          </code>
        </pre>
      </p>

      <h3>Update JSON record</h3>

      <p>
        <strong>PUT</strong>: <code>/r/:id</code>
      </p>

      <p>
        <strong>Headers</strong>:
        <ul>
          <li>Content-Type: application/json</li>
          <li>X-Access-Key: &lt;access-key&gt; (required)</li>
        </ul>
      </p>

      <p>
        <strong>Body</strong>:
        <ul>
          <li>
            JSON object to be <strong>replaced</strong> with the existing
            record.
          </li>
        </ul>
      </p>

      <p>
        <strong>Response</strong>:
        <pre>
          <code>
            {`{
  "record": {
    "sample": "Hello World"
  },
  "metadata": {
    "id": "<Record Id>",
    "createdAt": "<Date & Time>",
    "updatedAt": "<Date & Time>"
  }
}`}
          </code>
        </pre>
      </p>

      <h3>Delete JSON record</h3>

      <p>
        <strong>DELETE</strong>: <code>/r/:id</code>
      </p>

      <p>
        <strong>Headers</strong>:
        <ul>
          <li>Content-Type: application/json</li>
          <li>X-Access-Key: &lt;access-key&gt; (required)</li>
        </ul>
      </p>

      <p>
        <strong>Response</strong>:
        <pre>
          <code>
            {`{
  "metadata": {
    "id": "<Record Id>"
  },
  "message": "Deleted successfully"
}`}
          </code>
        </pre>
      </p>
    </div>
  )
}
