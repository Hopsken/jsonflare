import { ActionFunction } from '@remix-run/cloudflare'
import { nanoid, randomKey } from '../lib/nanoid'
import { recordKey } from '../lib/record'

export const action: ActionFunction = async ({ request, context }) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const { env } = context.cloudflare
  const jsonBody = await request.json()
  const headers = request.headers

  const apiKey = headers.get('x-api-key') || randomKey()
  const recordId = nanoid()

  const createdAt = new Date().toISOString()

  try {
    await env.records.put(recordKey(recordId), JSON.stringify(jsonBody), {
      metadata: {
        apiKey,
        recordId,
        createdAt,
        updatedAt: createdAt,
      },
    })

    return Response.json(
      {
        record: jsonBody,
        metadata: {
          id: recordId,
          createdAt,
          updatedAt: createdAt,
        },
      },
      {
        headers: {
          'x-api-key': apiKey,
        },
      }
    )
  } catch (error) {
    console.error(error)
    return new Response('Internal server error', { status: 500 })
  }
}
