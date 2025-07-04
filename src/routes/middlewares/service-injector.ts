import { createMiddleware } from 'hono/factory'
import { RecordService } from '../../service/record.service'

export const serviceInjector = createMiddleware<{
  Variables: {
    recordService: RecordService
  }
  Bindings: Bindings
}>((c, next) => {
  c.set('recordService', new RecordService(c.env.records))
  return next()
})
