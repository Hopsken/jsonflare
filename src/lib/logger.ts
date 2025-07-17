interface LogContext {
  error?: string
  stack?: string
  operation?: string
  [key: string]: unknown
}

class Logger {
  error(message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString()
    const logEntry = {
      level: 'error',
      timestamp,
      message,
      ...context
    }
    
    // In production, this could be sent to a logging service
    // For now, use console.error but in a structured format
    console.error(JSON.stringify(logEntry))
  }
  
  warn(message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString()
    const logEntry = {
      level: 'warn',
      timestamp,
      message,
      ...context
    }
    
    console.warn(JSON.stringify(logEntry))
  }
  
  info(message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString()
    const logEntry = {
      level: 'info',
      timestamp,
      message,
      ...context
    }
    
    console.log(JSON.stringify(logEntry))
  }
}

export const logger = new Logger()