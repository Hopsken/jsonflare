import { ErrorHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof HTTPException) {
    // Get the custom response
    return c.json(
      {
        message: err.message,
      },
      err.status
    )
  }

  console.error(err)
  return c.json(
    {
      message: 'internal server error',
    },
    500
  )
}
