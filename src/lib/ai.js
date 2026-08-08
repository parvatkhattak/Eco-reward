// Mock AI waste verification — simulates a vision model analysing the uploaded photo.
// Deterministic-ish for demos: uses the image file size as a pseudo-random seed so
// the same photo always gives the same result.

import { WASTE_TYPES } from './constants'

const QUALITY_LEVELS = ['Excellent Segregation', 'Good Segregation', 'Fair Segregation']

export function analyzeWastePhoto(file, selectedTypes, approxWeight) {
  return new Promise((resolve) => {
    // Simulate model inference time
    const delay = 1800 + Math.random() * 800

    setTimeout(() => {
      const seed = file.size % 100

      // ~15% of photos "contain plastic" (file size seed 0-14)
      if (seed < 15) {
        resolve({
          ok: false,
          title: 'Plastic detected',
          message: 'Please remove non-organic items (plastic covers, wrappers) and upload a new photo.',
        })
        return
      }

      const primary =
        WASTE_TYPES.find((t) => selectedTypes.includes(t.id)) ?? WASTE_TYPES[seed % WASTE_TYPES.length]

      // Estimated weight: near the user's estimate, or derived from seed
      const base = Number(approxWeight) > 0 ? Number(approxWeight) : 2 + (seed % 20)
      const estimated = Math.max(0.5, Math.round(base * (0.85 + (seed % 30) / 100) * 2) / 2)

      resolve({
        ok: true,
        title: `${primary.label} Detected`,
        detectedType: primary.id,
        estimatedWeight: estimated,
        quality: QUALITY_LEVELS[seed % QUALITY_LEVELS.length],
        confidence: 88 + (seed % 11),
      })
    }, delay)
  })
}

// Resize + compress an image file to a small JPEG data URL (keeps DB rows light)
export function fileToThumbnail(file, maxSize = 480) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.7))
    }
    img.onerror = reject
    img.src = url
  })
}
