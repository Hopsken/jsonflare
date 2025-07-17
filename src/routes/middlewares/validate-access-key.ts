import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { RecordService } from '../../service/record.service'
import { Context } from 'hono'
import { PublicMode } from '../../schemas/record'
import { RecordNotFoundError } from '../../lib/errors'

type CheckConditionFn = (c: Context) => Promise<boolean>

declare module 'hono' {
  interface ContextVariableMap {
    recordMetadataCache?: object
  }
}

export const publicModeCheck: CheckConditionFn = async (
  c: Context
): Promise<boolean> => {
  const id = c.req.param('id')
  const recordService = c.get('recordService')
  const metadata = await recordService.getMetadata(id)

  if (!metadata) {
    throw new RecordNotFoundError()
  }

  c.set('recordMetadataCache', metadata)

  if (metadata?.mode === PublicMode.Read) {
    // Skip access key check if public mode equals Read
    return false
  }
  return true
}

const resolve = (c: Context, checkCondition?: CheckConditionFn) => {
  if (!checkCondition) return true
  return checkCondition(c)
}

export const validateAccessKey = (checkCondition?: CheckConditionFn) => {
  return createMiddleware(async (c, next) => {
    const required = await resolve(c, checkCondition)

    if (!required) return next()

    const accessKey =
      c.req.header('X-Access-Key') ||
      c.req.header('Authorization')?.split(' ')[1]
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
      throw new RecordNotFoundError()
    }
    if (expectedAccessKey !== accessKey) {
      throw new HTTPException(401, { message: 'Invalid access key' })
    }

    return next()
  })
}
