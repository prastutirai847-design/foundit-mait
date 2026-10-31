const MAX_FILE_BYTES = 8 * 1024 * 1024
const MAX_EDGE = 1280
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export class ImageProcessingError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ImageProcessingError'
  }
}

/**
 * Compresses an uploaded image into a reasonably sized JPEG data URL so the
 * API payload and the stored listing stay small.
 */
export async function prepareImage(file: File): Promise<string> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new ImageProcessingError('Use a JPG, PNG or WebP image.')
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new ImageProcessingError('That image is larger than 8 MB. Please choose a smaller file.')
  }

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new ImageProcessingError('That image could not be read. Try a different file.')
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) {
    bitmap.close()
    throw new ImageProcessingError('Image preview is not supported in this browser.')
  }

  context.fillStyle = '#F8F5EF'
  context.fillRect(0, 0, width, height)
  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const dataUrl = canvas.toDataURL('image/jpeg', 0.82)
  if (dataUrl.length > 2_400_000) {
    return canvas.toDataURL('image/jpeg', 0.68)
  }
  return dataUrl
}
