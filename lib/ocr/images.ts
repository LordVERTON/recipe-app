export const IMAGE_LIMITS = { count: 4, bytes: 10 * 1024 * 1024, totalBytes: 40 * 1024 * 1024, pixels: 24_000_000, side: 8000, processedSide: 2400 }

export function validateImageFiles(files: readonly File[]) {
  if (files.length > IMAGE_LIMITS.count) throw new Error('Choisir au maximum 4 images.')
  if (files.reduce((n, f) => n + f.size, 0) > IMAGE_LIMITS.totalBytes) throw new Error('Les images dépassent 40 Mio au total.')
  for (const file of files) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Format non pris en charge. Exporter les HEIC/HEIF en JPEG, PNG ou WebP.')
    if (!file.size || file.size > IMAGE_LIMITS.bytes) throw new Error('Chaque image doit contenir entre 1 octet et 10 Mio.')
  }
}

export async function prepareImage(file: File, enhance: boolean): Promise<{ blob: Blob; width: number; height: number }> {
  validateImageFiles([file])
  let bitmap: ImageBitmap
  try { bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }) }
  catch { throw new Error('Image illisible ou format non décodable par ce navigateur. Essayer un export JPEG ou PNG.') }
  try {
    const { width, height } = bitmap
    if (width * height > IMAGE_LIMITS.pixels || Math.max(width, height) > IMAGE_LIMITS.side) throw new Error('Résolution trop grande : maximum 24 mégapixels et 8 000 pixels par côté. Réduire la photo avant import.')
    const ratio = enhance ? Math.min(1, IMAGE_LIMITS.processedSide / Math.max(width, height)) : 1
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio)
    const ctx = canvas.getContext('2d', { willReadFrequently: enhance })
    if (!ctx) throw new Error('Canvas indisponible dans ce navigateur.')
    try {
      ctx.fillStyle = 'white'; ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
      if (enhance) {
        // Mild contrast only. No thresholding/denoising that could erase thin handwriting.
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
        for (let i = 0; i < data.data.length; i += 4) {
          for (let c = 0; c < 3; c++) data.data[i + c] = Math.max(0, Math.min(255, (data.data[i + c] - 128) * 1.12 + 128))
        }
        ctx.putImageData(data, 0, 0)
      }
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Préparation de l’image impossible.')), 'image/png'))
      return { blob, width: canvas.width, height: canvas.height }
    } finally { canvas.width = 0; canvas.height = 0 }
  } finally { bitmap.close() }
}
