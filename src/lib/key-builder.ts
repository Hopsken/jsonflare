/**
 * Type-safe KV key builder for JSONFlare records
 * Prevents key collisions and ensures consistent key formats
 */

export class KeyBuilder {
  private static readonly NAMESPACE_SEPARATOR = ':'
  private static readonly RECORD_PREFIX = 'record'
  private static readonly ACCESS_KEY_SUFFIX = 'accesskey'
  private static readonly COUNT_KEY = 'records:count'

  /**
   * Validates that an ID is safe for use in KV keys
   * Prevents key collisions and injection attacks
   */
  private static validateId(id: string): void {
    if (!id || typeof id !== 'string') {
      throw new Error('ID must be a non-empty string')
    }
    
    if (id.includes(this.NAMESPACE_SEPARATOR)) {
      throw new Error(`ID cannot contain namespace separator "${this.NAMESPACE_SEPARATOR}"`)
    }
    
    if (id.trim() !== id) {
      throw new Error('ID cannot have leading or trailing whitespace')
    }
    
    // Prevent reserved patterns
    if (id === this.ACCESS_KEY_SUFFIX || id === 'count') {
      throw new Error(`ID cannot use reserved word: ${id}`)
    }
  }

  /**
   * Builds a KV key for a record's data
   */
  static forRecord(id: string): string {
    this.validateId(id)
    return `${this.RECORD_PREFIX}${this.NAMESPACE_SEPARATOR}${id}`
  }

  /**
   * Builds a KV key for a record's access key
   */
  static forAccessKey(id: string): string {
    this.validateId(id)
    return `${this.RECORD_PREFIX}${this.NAMESPACE_SEPARATOR}${id}${this.NAMESPACE_SEPARATOR}${this.ACCESS_KEY_SUFFIX}`
  }

  /**
   * Gets the key for the global record count
   */
  static forRecordCount(): string {
    return this.COUNT_KEY
  }

  /**
   * Extracts the record ID from a record key
   * Returns null if the key is not a valid record key
   */
  static extractRecordId(key: string): string | null {
    const prefix = `${this.RECORD_PREFIX}${this.NAMESPACE_SEPARATOR}`
    
    if (!key.startsWith(prefix)) {
      return null
    }
    
    const remainder = key.slice(prefix.length)
    const parts = remainder.split(this.NAMESPACE_SEPARATOR)
    
    // Should be just the ID (for record keys) or ID + 'accesskey' (for access key keys)
    if (parts.length === 1) {
      return parts[0] // Record key: "record:id"
    } else if (parts.length === 2 && parts[1] === this.ACCESS_KEY_SUFFIX) {
      return parts[0] // Access key: "record:id:accesskey"
    }
    
    return null
  }

  /**
   * Checks if a key is a record data key (not access key)
   */
  static isRecordKey(key: string): boolean {
    const id = this.extractRecordId(key)
    return id !== null && key === this.forRecord(id)
  }

  /**
   * Checks if a key is an access key
   */
  static isAccessKeyKey(key: string): boolean {
    const id = this.extractRecordId(key)
    return id !== null && key === this.forAccessKey(id)
  }
}