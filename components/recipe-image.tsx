"use client"

import { useState, type ComponentProps } from 'react'
import { getFallbackRecipeImageUrl } from '@/lib/recipe-images'

// The failed source is tracked separately so a new photo is tried after a recipe
// refresh. The local fallback never triggers another network retry loop.
export function RecipeImage({ src, alt, ...props }: Omit<ComponentProps<'img'>, 'onError'> & { src: string; alt: string }) {
  const [failedSource, setFailedSource] = useState<string | null>(null)
  const fallback = getFallbackRecipeImageUrl()
  return <img {...props} src={failedSource === src ? fallback : src} alt={alt}
    onError={() => { if (src !== fallback) setFailedSource(src) }} />
}
