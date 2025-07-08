import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'

export const host = (whitelisted: string[] | string) => {
  const listArray = Array.isArray(whitelisted) ? whitelisted : [whitelisted]
  return createMiddleware((c, next) => {
    const host = c.req.header('Host')

    if (
      // localhost are always allowed
      host?.startsWith('localhost') ||
      listArray.some(allowed => allowed === host)
    ) {
      return next()
    }

    throw new HTTPException(404)
  })
}
