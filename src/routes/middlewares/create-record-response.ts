import { createMiddleware } from 'hono/factory'
import { Record } from '../../model/record'
import { Context } from 'hono'
import { ContentfulStatusCode } from 'hono/utils/http-status'

export const createRecordResponse = createMiddleware<{
  Variables: {
    sendRecord: (record: Record) => Response
  }
}>(async (c, next) => {
  const buildRecordResponse =
    (ctx: Context) =>
    <T extends ContentfulStatusCode = ContentfulStatusCode>(
      record: Record,
      arg?: T,
      headers?: HeadersInit
    ): Response => {
      const shouldCollapseMeta =
        ctx.req.query('meta') === 'false' ||
        ctx.req.header('X-Bin-Meta') === 'false' ||
        ctx.req.header('X-Include-Meta') === 'false'

      const returnValue = shouldCollapseMeta ? record.data : record

      return ctx.json(returnValue as object, arg, {
        'Content-Type': 'application/json',
        'X-Record-Id': record.id,
        ...headers,
      })
    }

  c.set('sendRecord', buildRecordResponse(c))

  await next()
})
