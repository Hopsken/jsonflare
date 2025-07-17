import { HTTPException } from 'hono/http-exception'

export class RecordNotFoundError extends HTTPException {
  constructor(message = 'Record not found') {
    super(404, { message })
  }
}