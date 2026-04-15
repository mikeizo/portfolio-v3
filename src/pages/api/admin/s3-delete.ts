import type { APIRoute } from 'astro'

import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3'

import { isAllowedS3ObjectKey, S3_UPLOAD_PREFIX } from './presign'

const jsonHeaders = {
  'Content-Type': 'application/json'
}

/** Turn a DB-relative gallery path into a full bucket key. */
function fullKeyFromRelative(rel: string): string | null {
  const trimmed = rel.trim().replace(/^\/+/, '')
  if (!trimmed || trimmed.includes('..') || trimmed.includes('\\')) {
    return null
  }
  const key = `${S3_UPLOAD_PREFIX}/${trimmed}`
  return isAllowedS3ObjectKey(key) ? key : null
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as { keys?: unknown }
    const raw =
      Array.isArray(body.keys) && body.keys.every((k) => typeof k === 'string')
        ? (body.keys as string[])
        : []

    if (!raw.length) {
      return new Response(JSON.stringify({ error: 'No keys provided' }), {
        status: 400,
        headers: jsonHeaders
      })
    }

    const fullKeys: string[] = []
    for (const rel of raw) {
      const key = fullKeyFromRelative(rel)
      if (!key) {
        return new Response(JSON.stringify({ error: `Invalid key: ${rel}` }), {
          status: 400,
          headers: jsonHeaders
        })
      }
      fullKeys.push(key)
    }

    const region = import.meta.env.AWS_REGION_APP as string | undefined
    const bucket = import.meta.env.AWS_BUCKET as string | undefined
    const accessKeyId = import.meta.env.AWS_KEY as string | undefined
    const secretAccessKey = import.meta.env.AWS_SECRET as string | undefined

    if (!region || !bucket || !accessKeyId || !secretAccessKey) {
      return new Response(
        JSON.stringify({ error: 'Upload is not configured' }),
        { status: 500, headers: jsonHeaders }
      )
    }

    const client = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey }
    })

    for (const Key of fullKeys) {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key }))
    }

    return new Response(JSON.stringify({ deleted: fullKeys.length }), {
      status: 200,
      headers: jsonHeaders
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: jsonHeaders
    })
  }
}
