import { createMiddleware } from 'hono/factory'
import { RecordService } from '../../service/record.service'

declare module 'hono' {
  interface ContextVariableMap {
    recordService: RecordService
  }
}

export const serviceInjector = createMiddleware((c, next) => {
  c.set('recordService', new RecordService(c.env.records))
  return next()
})
