import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { RecordService } from '../../service/record.service'

export const validateAccessKey = createMiddleware(async (c, next) => {
  const accessKey =
    c.req.header('X-Access-Key') || c.req.header('Authorization')?.split(' ')[1]
  if (!accessKey) {
    throw new HTTPException(401, { message: 'Access key is required' })
  }

  const recordService = c.get('recordService') as RecordService

  const id = c.req.param('id')
  if (!id) {
    throw new HTTPException(400, { message: 'Record ID is required' })
  }

  const expectedAccessKey = await recordService.getAccessKey(id)
  if (!expectedAccessKey) {
    throw new HTTPException(404, { message: 'Record not found' })
  }
  if (expectedAccessKey !== accessKey) {
    throw new HTTPException(401, { message: 'Invalid access key' })
  }

  return next()
})
