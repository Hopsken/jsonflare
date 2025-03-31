## API

### Create new record

Store a JSON record.

**Route**: `/r`

**Method**: `POST`

**Headers**:

- Content-Type: application/json
- X-Api-Key: <api-key> (optional, if not specific, a random one will be generated for your and returned along with the response header.)

**Response**:

```json
// headers
x-api-key: <api-key>

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
}
```

### Get record

Read a stored JSON record.

**Route**: `/r/:id`

**Method**: `GET`

**Headers**:

- Content-Type: application/json
- X-Api-Key: <api-key> (required)

**Response**:

```json
{
  "record": {
    "sample": "Hello World"
  },
  "metadata": {
    "id": "<Record Id>",
    "createdAt": "<Date & Time>",
    "updatedAt": "<Date & Time>"
  }
}
```

### Update record

Update a stored JSON record.

**Route**: `/r/:id`

**Method**: `PUT`

**Headers**:

- Content-Type: application/json
- X-Api-Key: <api-key> (required)

**Body**:

- JSON object to be **replaced** with the existing record.

**Response**:

```json
{
  "record": {
    "sample": "Hello World"
  },
  "metadata": {
    "id": "<Record Id>",
    "createdAt": "<Date & Time>",
    "updatedAt": "<Date & Time>"
  }
}
```

### Delete record

Delete a stored JSON record.

**Route**: `/r/:id`

**Method**: `DELETE`

**Headers**:

- Content-Type: application/json
- X-Api-Key: <api-key> (required)

**Response**:

```json
{
  "metadata": {
    "id": "<Record Id>"
  },
  "message": "Deleted successfully"
}
```
