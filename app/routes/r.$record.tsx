import { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import { recordKey } from '../lib/record'

type Metadata = {
  apiKey: string
  createdAt: string
  updatedAt: string
}

export const loader: LoaderFunction = async ({ request, context, params }) => {
  const { env } = context.cloudflare
  const headers = request.headers

  const apiKey = headers.get('x-api-key')
  const recordId = params.record

  if (!apiKey || !recordId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const record = await env.records.getWithMetadata<object, Metadata>(
    recordKey(recordId),
    'json'
  )

  if (!record || !record.metadata) {
    return new Response('Not Found', { status: 404 })
  }

  const { metadata } = record
  if (metadata.apiKey !== apiKey) {
    return new Response('Unauthorized', { status: 401 })
  }

  return Response.json({
    record: record.value,
    metadata: {
      id: recordId,
      createdAt: metadata.createdAt,
      updatedAt: metadata.updatedAt,
    },
  })
}

export const action: ActionFunction = async ({ request, context, params }) => {
  const { env } = context.cloudflare
  const headers = request.headers

  const method = request.method

  if (method !== 'DELETE' && method !== 'PUT') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const apiKey = headers.get('x-api-key')
  const recordId = params.record
  if (!apiKey || !recordId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const record = await env.records.getWithMetadata<object, Metadata>(
    recordKey(recordId),
    'json'
  )

  if (!record || !record.metadata) {
    return new Response('Not Found', { status: 404 })
  }

  const { metadata } = record
  if (metadata.apiKey !== apiKey) {
    return new Response('Unauthorized', { status: 401 })
  }

  if (method === 'DELETE') {
    await env.records.delete(recordKey(recordId))
    return Response.json({
      metadata: {
        id: recordId,
      },
      message: 'Deleted successfully',
    })
  }

  if (method === 'PUT') {
    const jsonBody = await request.json()
    const updatedAt = new Date().toISOString()
    await env.records.put(recordKey(recordId), JSON.stringify(jsonBody), {
      metadata: {
        apiKey,
        createdAt: metadata.createdAt,
        updatedAt,
      },
    })
    return Response.json({
      record: jsonBody,
      metadata: {
        id: recordId,
        createdAt: metadata.createdAt,
        updatedAt,
      },
    })
  }

  return new Response('Method Not Allowed', { status: 405 })
}
