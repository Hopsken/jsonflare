import {
  Schema,
  SchemaDraft,
  ValidationResult,
  Validator,
} from '@cfworker/json-schema'
import { Record } from '../models/record'
import ky from 'ky'

export async function validateSchema(
  record: Record
): Promise<ValidationResult> {
  const schemaUrl = record.schemaUrl

  if (!schemaUrl) return { valid: true, errors: [] }
  if (schemaUrl.startsWith('https://json-schema.org/draft')) {
    // skip checks for json schema definitions
    return { valid: true, errors: [] }
  }

  const schema = await ky.get<Schema>(record.schemaUrl).json()

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
