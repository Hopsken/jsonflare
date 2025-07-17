import {
  Schema,
  SchemaDraft,
  ValidationResult,
  Validator,
} from '@cfworker/json-schema'
import { Record } from '../models/record'
import ky from 'ky'
import { HTTPException } from 'hono/http-exception'

// Cache for schema responses (simple in-memory cache)
const schemaCache = new Map<string, { schema: Schema; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Trusted domain whitelist for schema URLs
const TRUSTED_SCHEMA_DOMAINS = [
  'json-schema.org',
  'schema.org',
  'raw.githubusercontent.com',
  'api.jsonflare.com',
  // Add more trusted domains as needed
]

function isValidSchemaUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    
    // Only allow HTTPS
    if (parsedUrl.protocol !== 'https:') {
      return false
    }
    
    // Check against whitelist
    return TRUSTED_SCHEMA_DOMAINS.some(domain => 
      parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`)
    )
  } catch {
    return false
  }
}

async function fetchSchemaWithSafety(url: string): Promise<Schema> {
  // Check cache first
  const cached = schemaCache.get(url)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.schema
  }

  if (!isValidSchemaUrl(url)) {
    throw new HTTPException(400, { 
      message: 'Schema URL is not from a trusted domain' 
    })
  }

  try {
    const schema = await ky.get<Schema>(url, {
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'JSONFlare/1.0'
      }
    }).json()

    // Cache the response
    schemaCache.set(url, { schema, timestamp: Date.now() })
    
    return schema
  } catch (error) {
    throw new HTTPException(400, { 
      message: 'Failed to fetch schema from URL',
      cause: error instanceof Error ? error.message : String(error)
    })
  }
}

export async function validateSchema(
  record: Record
): Promise<ValidationResult> {
  const schemaUrl = record.schemaUrl

  if (!schemaUrl) return { valid: true, errors: [] }
  if (schemaUrl.startsWith('https://json-schema.org/draft')) {
    // skip checks for json schema definitions
    return { valid: true, errors: [] }
  }

  const schema = await fetchSchemaWithSafety(schemaUrl)

  const draftVersion = getJsonSchemaDraftVersion(schema)
  // defaults to draft-2020-12
  const validator = new Validator(schema, draftVersion ?? '2020-12')
  const result = validator.validate(record.data)
  return result
}

function getJsonSchemaDraftVersion(schema: {
  $schema?: string
}): SchemaDraft | null {
  if (!schema.$schema) {
    return null // Return null if $schema is not present
  }

  const schemaUri = schema.$schema.replace(/#$/, '')

  // Define a mapping of schema URIs to their corresponding draft versions
  const draftVersions: { [key: string]: SchemaDraft } = {
    'http://json-schema.org/draft-04/schema': '4',
    'http://json-schema.org/draft-07/schema': '7',
    'https://json-schema.org/draft-2019-09/schema': '2019-09',
    'https://json-schema.org/draft-2020-12/schema': '2020-12',
  }

  // Return the draft version based on the schema URI
  return draftVersions[schemaUri] || null // Return null if the version is unknown
}
