import { notFound } from 'next/navigation'
import { OcrPrototype } from '@/components/ocr/ocr-prototype'

export default function OcrPage() {
  if (process.env.NODE_ENV !== 'development') notFound()
  return <OcrPrototype />
}
