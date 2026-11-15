import type { PaddleOCR, OcrResult } from '@paddleocr/paddleocr-js'
import { orderOcrLines } from './merge'
import type { OcrPage } from './types'

export type OcrEngine = {
  predict: (blob: Blob, index: number) => Promise<OcrPage>
  dispose: () => void
  loadMs: number
  execution: string
}
const assetRoot = '/ocr/0.4.2/'

export async function createOcrEngine(backend: 'wasm' | 'webgpu', mainThread = false, signal?: AbortSignal): Promise<OcrEngine> {
  const start = performance.now()
  let worker: Worker | undefined
  let instance: Awaited<ReturnType<typeof PaddleOCR.create>> | undefined
  let disposed = false
  const pending = new Set<() => void>()
  const dispose = () => {
    if (disposed) return
    disposed = true
    for (const reject of [...pending]) reject()
    if (worker) worker.terminate()
    else if (instance) void instance.dispose()
    signal?.removeEventListener('abort', dispose)
  }
  signal?.addEventListener('abort', dispose, { once: true })
  const timeout = <T,>(promise: Promise<T>, ms: number): Promise<T> => new Promise((resolve, reject) => {
    const stop = () => { cleanup(); dispose(); reject(new Error('Traitement interrompu.')) }
    const timer = setTimeout(() => { cleanup(); dispose(); reject(new Error('Le moteur OCR ne répond plus. Réinitialiser puis réessayer en WASM ou avec une image plus petite.')) }, ms)
    const cleanup = () => { clearTimeout(timer); signal?.removeEventListener('abort', stop); pending.delete(stop) }
    pending.add(stop)
    signal?.addEventListener('abort', stop, { once: true })
    if (signal?.aborted) return stop()
    promise.then(value => { cleanup(); resolve(value) }, error => { cleanup(); reject(error) })
  })
  try {
    // The SDK and its OpenCV import are never in the normal application route.
    const { PaddleOCR } = await import('@paddleocr/paddleocr-js')
    if (signal?.aborted) throw new Error('Traitement interrompu.')
    instance = await timeout(PaddleOCR.create({
      lang: 'fr', ocrVersion: 'PP-OCRv6',
      textDetectionModelName: 'PP-OCRv6_small_det', textRecognitionModelName: 'PP-OCRv6_small_rec',
      textDetectionModelAsset: { url: new URL(assetRoot + 'PP-OCRv6_small_det.tar', location.origin).href },
      textRecognitionModelAsset: { url: new URL(assetRoot + 'PP-OCRv6_small_rec.tar', location.origin).href },
      worker: mainThread ? false : { createWorker: () => {
        worker = new Worker(assetRoot + 'worker.js', { type: 'module' })
        return worker
      } },
      ortOptions: { backend, wasmPaths: new URL(assetRoot, location.origin).href, numThreads: 1, proxy: false, disableWasmProxy: true },
      textRecognitionBatchSize: 1,
    }), 120_000)
    const engine = instance
    return {
      loadMs: performance.now() - start, execution: mainThread ? 'Fil principal (repli explicite)' : 'Worker officiel', dispose,
      async predict(blob, sourceIndex) {
        if (disposed) throw new Error('Moteur libéré. Relancer la reconnaissance.')
        const [result]: OcrResult[] = await timeout(engine.predict(blob, {
          textRecScoreThresh: 0, textDetLimitSideLen: 1600, textDetMaxSideLimit: 2400,
        }), 180_000)
        return {
          width: result.image.width, height: result.image.height,
          lines: orderOcrLines(result.items.map(item => ({ ...item, sourceIndex }))),
          elapsedMs: result.metrics.totalMs,
          runtime: `${result.runtime.detProvider} / ${result.runtime.recProvider}`,
        }
      },
    }
  } catch (error) {
    dispose()
    throw new Error(`OCR indisponible. Vérifier « npm run ocr:prepare ». ${error instanceof Error ? error.message : 'Réessayer en WASM.'}`)
  }
}
