/**
 * useFileUpload — Convex-native file upload (replaces Uploadcare).
 * Files are stored in Convex storage and served publicly via
 * the /file/{storageId} HTTP action in convex/http.ts.
 *
 * Public URL pattern:
 *   https://<deployment>.convex.site/file/<storageId>
 */
import { useState, useCallback } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'

interface UploadResult {
  storageId: Id<'_storage'>
  publicUrl: string
}

interface UseFileUploadOptions {
  maxSizeMb?: number
  accept?: string[]        // e.g. ['image/jpeg', 'image/png', 'image/webp']
}

/** Convert a Convex .cloud URL to .site for HTTP actions */
export function getConvexFileUrl(storageId: string): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_CONVEX_URL_STAGING ||
    process.env.NEXT_PUBLIC_CONVEX_URL_PRODUCTION ||
    ''
  const siteUrl = baseUrl.replace('.cloud', '.site')
  return `${siteUrl}/file/${storageId}`
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const { maxSizeMb = 10, accept } = options
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const saveFileUrl = useMutation(api.files.saveFileUrl)

  const uploadFile = useCallback(async (file: File): Promise<UploadResult | null> => {
    setError(null)

    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`File too large. Max size: ${maxSizeMb}MB`)
      return null
    }

    if (accept && accept.length > 0 && !accept.includes(file.type)) {
      setError(`Invalid file type. Allowed: ${accept.join(', ')}`)
      return null
    }

    setIsUploading(true)

    try {
      const uploadUrl = await generateUploadUrl()

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      })

      if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`)

      const { storageId } = await response.json() as { storageId: Id<'_storage'> }

      // Save file metadata
      await saveFileUrl({
        storageId,
        fileName: file.name,
        fileType: file.type,
      })

      return {
        storageId,
        publicUrl: getConvexFileUrl(storageId),
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setError(message)
      return null
    } finally {
      setIsUploading(false)
    }
  }, [generateUploadUrl, saveFileUrl, maxSizeMb, accept])

  const uploadMultipleFiles = useCallback(async (files: File[]): Promise<UploadResult[]> => {
    const results = await Promise.all(files.map(uploadFile))
    return results.filter((r): r is UploadResult => r !== null)
  }, [uploadFile])

  return { uploadFile, uploadMultipleFiles, isUploading, error, getConvexFileUrl }
}
