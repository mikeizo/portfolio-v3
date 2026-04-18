import { fileExtension, sanitizeImageFileStem } from '@/utils/slug'
import { ref } from 'vue'
import { S3_UPLOAD_PREFIX } from '@/pages/api/admin/presign'

type UploadOptions = {
  maxSize?: number
  accept?: RegExp
}

const DEFAULT_MAX_SIZE = 2 * 1024 * 1024
const DEFAULT_ACCEPT = /^image\//

export function useS3Upload(options: UploadOptions = {}) {
  const maxSize = options.maxSize ?? DEFAULT_MAX_SIZE
  const accept = options.accept ?? DEFAULT_ACCEPT

  const uploading = ref(false)
  const progress = ref<{ current: number; total: number } | null>(null)

  function assertFile(file: File) {
    if (file.size > maxSize) {
      throw new Error(
        `File "${file.name}" is too large (max ${maxSize / 1024 / 1024}MB).`
      )
    }
    if (!accept.test(file.type)) {
      throw new Error(`"${file.name}" is not an accepted file type.`)
    }
  }

  function buildUniqueKey(dir: string, file: File, used: Set<string>): string {
    const ext = fileExtension(file.name)
    const base = sanitizeImageFileStem(file.name)
    let stem = base
    let n = 2
    let rel = `${dir}/${stem}.${ext}`

    while (used.has(rel)) {
      stem = `${base}-${n}`
      n++
      rel = `${dir}/${stem}.${ext}`
    }
    used.add(rel)

    return rel
  }

  async function putToS3(relativeKey: string, file: File): Promise<void> {
    const contentType = file.type || 'application/octet-stream'
    const fullKey = `${S3_UPLOAD_PREFIX}/${relativeKey}`

    const presignRes = await fetch('/api/admin/presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: fullKey, contentType })
    })

    if (!presignRes.ok) {
      const err = (await presignRes.json().catch(() => ({}))) as {
        error?: string
      }
      throw new Error(err.error || 'Could not prepare upload.')
    }

    const { url } = (await presignRes.json()) as { url: string }

    const putRes = await fetch(url, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': contentType }
    })

    if (!putRes.ok) {
      throw new Error(`Upload failed for "${file.name}".`)
    }
  }

  async function presignAndPut(relativeKey: string, file: File): Promise<void> {
    assertFile(file)
    uploading.value = true
    try {
      await putToS3(relativeKey, file)
    } finally {
      uploading.value = false
    }
  }

  async function uploadMany(
    files: File[],
    buildKey: (file: File, index: number) => string
  ): Promise<string[]> {
    for (const file of files) assertFile(file)

    const keys: string[] = []
    uploading.value = true
    progress.value = { current: 0, total: files.length }

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const relativeKey = buildKey(file, i)
        await putToS3(relativeKey, file)
        keys.push(relativeKey)
        progress.value = { current: i + 1, total: files.length }
      }
    } finally {
      uploading.value = false
      progress.value = null
    }

    return keys
  }

  async function deleteKeys(relativeKeys: string[]): Promise<void> {
    if (!relativeKeys.length) return

    const res = await fetch('/api/admin/s3-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keys: relativeKeys })
    })

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string }
      throw new Error(err.error || 'Could not delete files from storage.')
    }
  }

  return {
    uploading,
    progress,
    assertFile,
    buildUniqueKey,
    presignAndPut,
    uploadMany,
    deleteKeys
  }
}
