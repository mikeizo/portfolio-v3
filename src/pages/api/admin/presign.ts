import type { APIRoute } from 'astro'

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const S3_UPLOAD_PREFIX = 'portfolio'
const IMAGE_CONTENT = /^image\//

const jsonHeaders = {
  'Content-Type': 'application/json'
}

export function isAllowedS3ObjectKey(key: string): boolean {
  if (!key || key.includes('..') || key.startsWith('/') || key.includes('\\')) {
    return false
  }
  const prefix = `${S3_UPLOAD_PREFIX}/`
  if (!key.startsWith(prefix)) {
    return false
  }
  const rest = key.slice(prefix.length)
  const logosWebp = /^logos\/webp\/[a-zA-Z0-9._-]+$/
  const about = /^about\/[a-zA-Z0-9._-]+$/
  const gallery = /^[a-z0-9]+(?:-[a-z0-9]+)*\/[a-zA-Z0-9._-]+$/
  return logosWebp.test(rest) || about.test(rest) || gallery.test(rest)
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as {
      key?: unknown
      contentType?: unknown
    }

    const key = typeof body.key === 'string' ? body.key : ''
    const contentType =
      typeof body.contentType === 'string' ? body.contentType : ''

    if (!isAllowedS3ObjectKey(key) || !IMAGE_CONTENT.test(contentType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid key or content type' }),
        { status: 400, headers: jsonHeaders }
      )
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

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType
    })

    const url = await getSignedUrl(client, command, { expiresIn: 900 })

    return new Response(JSON.stringify({ url, key }), {
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
