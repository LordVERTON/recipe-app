import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'

const base = new URL(process.env.TEST_APP_URL || 'http://localhost:3100')
assert.ok(['localhost', '127.0.0.1'].includes(base.hostname), 'Loopback only')
const { chromium, devices } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const browser = await chromium.launch({ headless: true })
const production = process.argv.includes('--production')
async function run() {
try {
  const context = await browser.newContext(process.env.TEST_MOBILE === '1' ? devices['Pixel 7'] : { viewport: { width: 1440, height: 1000 } })
  let page = await context.newPage()
  const errors = [], external = [], writes = [], resources = []
  function observe(observedPage) {
  observedPage.on('pageerror', e => { errors.push(e.message); console.error(e.message.slice(0, 1000)) })
  observedPage.on('console', message => {
    if (message.type() === 'error' && /cannot release session|unhandledRejection/.test(message.text())) errors.push(message.text())
  })
  observedPage.on('request', r => {
    const url = new URL(r.url())
    if (!['localhost', '127.0.0.1'].includes(url.hostname) && !['blob:', 'data:'].includes(url.protocol)) external.push(url.origin)
    if (r.method() !== 'GET' && r.method() !== 'HEAD') writes.push(r.url())
    if (/\/ocr\/|paddleocr|opencv|ort-wasm/.test(url.pathname)) resources.push(url.pathname)
  })
  }
  observe(page)
  await context.route('**/*', route => {
    const url = new URL(route.request().url())
    return ['localhost', '127.0.0.1'].includes(url.hostname) || ['blob:', 'data:'].includes(url.protocol) ? route.continue() : route.abort()
  })
  await page.goto(base.href)
  await page.locator('body').waitFor()
  assert.deepEqual(resources, [], 'Normal application must not load the SDK or models')
  // Close the catalogue before OCR: its async signed-URL read is a POST and may
  // finish after navigation. The scan itself must make zero such requests.
  await page.close()
  page = await context.newPage()
  observe(page)
  external.length = 0; writes.length = 0; errors.length = 0
  const response = await page.goto(new URL('/dev/ocr', base).href)
  if (production) {
    assert.equal(response.status(), 404)
    assert.equal(await page.getByRole('heading', { name: 'Numériser une recette' }).count(), 0)
    assert.deepEqual(resources, [])
    console.log('PASS production: direct GET /dev/ocr returns 404, no OCR interface or resources on normal pages.')
  } else {
    await page.getByRole('heading', { name: 'Numériser une recette' }).waitFor()
    assert.equal(resources.some(r => r.endsWith('.tar')), false, 'No models before explicit recognition')
    await page.getByRole('button', { name: 'Coller un texte', exact: true }).click()
    await page.getByLabel('Texte de la recette', { exact: true }).fill('Soupe de test\nPour 2 personnes\nDurée : 30 min\nIngrédients :\n250 g de carottes\n1 oignon\nPréparation :\nCouper les légumes.\nCuire dans de l’eau.')
    await page.getByRole('button', { name: 'Analyser le texte et créer un brouillon' }).click()
    await page.getByRole('heading', { name: 'Brouillon modifiable' }).waitFor()
    assert.equal(resources.some(r => r.endsWith('.tar')), false, 'Text parsing bypasses OCR')
    await page.getByLabel('Nom de la recette', { exact: true }).fill('Soupe corrigée')
    await page.getByLabel('Saison', { exact: true }).selectOption('hiver')
    await page.getByLabel('Catégorie', { exact: true }).selectOption('salé')
    await page.getByLabel('Type de repas', { exact: true }).selectOption('dejeuner/diner')
    await page.getByLabel(/J’ai relu les quantités/).check()
    await page.getByRole('button', { name: 'Vérifier et confirmer le brouillon local' }).click()
    await page.getByText('Brouillon confirmé localement. Aucune recette enregistrée.', { exact: true }).waitFor()
    await page.getByRole('button', { name: 'Photographier une recette', exact: true }).click()
    assert.equal(await page.getByLabel('Nom de la recette', { exact: true }).inputValue(), 'Soupe corrigée')
    await page.getByRole('button', { name: 'Réinitialiser', exact: true }).click()
    const picker = page.getByLabel('Choisir dans la galerie', { exact: true })
    await picker.setInputFiles({ name: 'invalid.heic', mimeType: 'image/heic', buffer: Buffer.from('invalid') })
    await page.getByRole('alert').filter({ hasText: 'Format non pris en charge' }).waitFor()
    await picker.setInputFiles({ name: 'large.png', mimeType: 'image/png', buffer: Buffer.alloc(10 * 1024 * 1024 + 1) })
    await page.getByRole('alert').filter({ hasText: '10 Mio' }).waitFor()
    await picker.setInputFiles({ name: 'invalid.png', mimeType: 'image/png', buffer: Buffer.from('not an image') })
    await page.getByRole('button', { name: 'Lancer la reconnaissance' }).click()
    await page.getByRole('alert').filter({ hasText: 'Image illisible' }).waitFor()
    await page.getByRole('button', { name: 'Réinitialiser', exact: true }).click()
    console.log('PASS invalid files, size and decode errors')
    const png = await page.evaluate(() => {
      const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 1600
      const ctx = canvas.getContext('2d'); ctx.fillStyle = 'white'; ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = 'black'; ctx.font = '38px Arial'
      const lines = ['Soupe de carottes', 'Pour 2 personnes', 'Ingredients :', '250 g de carottes', '1 oignon', 'Preparation :', 'Couper les legumes.', 'Cuire pendant 20 minutes.']
      lines.forEach((line, i) => ctx.fillText(line, 80, 120 + i * 100))
      return canvas.toDataURL('image/png').split(',')[1]
    })
    await picker.setInputFiles({ name: 'synthetic-recipe.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') })
    if (process.argv.includes('--original')) await page.getByLabel(/Prétraiter : contraste léger/).uncheck()
    if (process.argv.includes('--webgpu') || process.argv.includes('--main-thread')) {
      await page.getByText('Options du moteur et préparation hors ligne', { exact: true }).click()
      if (process.argv.includes('--webgpu')) await page.getByRole('combobox').selectOption('webgpu')
      if (process.argv.includes('--main-thread')) await page.getByLabel(/Repli sur le fil principal/).check()
    }
    // This heartbeat measures UI responsiveness during worker initialization and recognition.
    await page.evaluate(() => { window.ocrTicks = 0; window.ocrTimer = setInterval(() => window.ocrTicks++, 100) })
    await page.getByRole('button', { name: 'Lancer la reconnaissance' }).click()
    const ocrError = page.locator('main > [role="alert"]')
    await page.getByRole('status').filter({ hasText: /Transcription disponible/ }).or(ocrError).waitFor({ timeout: 240_000 })
    if (await ocrError.isVisible()) {
      const message = await ocrError.innerText()
      if (!process.argv.includes('--webgpu')) throw new Error(message)
      assert.match(message, /WebGPU|webgpu/)
      console.log('WebGPU attempted, unavailable in this environment:', message)
      return
    }
    const recognized = await page.getByLabel('Transcription fusionnée à corriger', { exact: true }).inputValue()
    assert.match(recognized.toLowerCase(), /carottes/)
    assert.match(recognized, /250/)
    if (!process.argv.includes('--main-thread')) assert.ok(resources.some(r => r.endsWith('worker.js')), 'Official static module worker loaded')
    assert.ok(resources.some(r => r.endsWith('.wasm')), 'Local WASM loaded')
    assert.equal(resources.filter(r => r.endsWith('.tar')).length, 2, 'Exactly two local models')
    await page.getByText('Mesures observées pour comparer les essais', { exact: true }).click()
    const timings = await page.locator('tbody').innerText()
    const ticks = await page.evaluate(() => { clearInterval(window.ocrTimer); return window.ocrTicks })
    if (!process.argv.includes('--main-thread')) assert.ok(ticks > 5, 'UI heartbeat continued during OCR')
    await page.getByRole('button', { name: 'Analyser le texte et créer un brouillon' }).click()
    await page.getByRole('heading', { name: 'Brouillon modifiable' }).waitFor()
    assert.equal(await page.getByLabel('Quantité 1', { exact: true }).inputValue(), '250')
    const firstTimings = timings
    if (!process.argv.includes('--webgpu') && !process.argv.includes('--main-thread')) {
      // Two newly authored overlapping screenshots; retain the initialized engine.
      await page.getByRole('button', { name: 'Importer des captures', exact: true }).click()
      await page.getByRole('button', { name: 'Retirer l’image 1', exact: true }).click()
      const makeImage = async lines => Buffer.from(await page.evaluate(lines => {
        const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 1600
        const ctx = canvas.getContext('2d'); ctx.fillStyle = 'white'; ctx.fillRect(0, 0, 1200, 1600)
        ctx.fillStyle = 'black'; ctx.font = '38px Arial'
        lines.forEach((line, i) => ctx.fillText(line, 80, 120 + i * 100))
        return canvas.toDataURL('image/png').split(',')[1]
      }, lines), 'base64')
      const overlap = ['100 g de yaourt nature', '1 cuillere de sucre', 'Quelques feuilles de basilic']
      const one = { name: 'page-one.png', mimeType: 'image/png', buffer: await makeImage(['Salade de test', 'Ingredients :', '200 g de fromage frais', ...overlap]) }
      const two = { name: 'page-two.png', mimeType: 'image/png', buffer: await makeImage([...overlap, 'Preparation :', 'Couper les legumes.', 'Assembler la salade.']) }
      await page.getByLabel('Sélectionner des captures', { exact: true }).setInputFiles([two, one])
      await page.getByRole('button', { name: 'Avancer l’image 2', exact: true }).click()
      assert.match(await page.locator('section[aria-label="Sources de la recette"] ol > li').first().innerText(), /page-one/)
      page.once('dialog', dialog => dialog.accept())
      await page.getByRole('button', { name: 'Lancer la reconnaissance' }).click()
      await page.getByRole('status').filter({ hasText: /Transcription disponible/ }).waitFor({ timeout: 240_000 })
      assert.match(await page.getByRole('status').first().innerText(), /3 lignes de chevauchement retirées/)
      const merged = await page.getByLabel('Transcription fusionnée à corriger', { exact: true }).inputValue()
      assert.equal(merged.toLowerCase().split('yaourt').length, 2, 'Boundary overlap removed once')
      assert.match(merged.toLowerCase(), /assembler/)
      assert.equal(resources.filter(r => r.endsWith('.tar')).length, 2, 'No repeated model downloads')
      // Recognition/text changes keep the manually edited draft until explicit replacement.
      await page.getByLabel('Nom de la recette', { exact: true }).fill('Correction à conserver')
      page.once('dialog', dialog => dialog.dismiss())
      await page.getByRole('button', { name: 'Analyser le texte et créer un brouillon' }).click()
      assert.equal(await page.getByLabel('Nom de la recette', { exact: true }).inputValue(), 'Correction à conserver')
      console.log('PASS real multipage OCR, reorder, exact overlap, model reuse and manual draft preservation')
    }
    await mkdir('supabase/.temp', { recursive: true })
    await page.screenshot({ path: 'supabase/.temp/ocr-prototype.png', fullPage: true })
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Responsive: no horizontal overflow')
    assert.deepEqual(errors, [])
    assert.deepEqual(external, [], 'No attempted external network during OCR workflow')
    assert.deepEqual(writes, [], 'No HTTP writes or OCR content transfer')
    const report = { browser: browser.version(), mobileEmulation: process.env.TEST_MOBILE === '1', timings: await page.locator('tbody').innerText(), firstTimings, ticks, externalRequests: external.length, writes: writes.length, resources }
    const variant = process.argv.find(arg => ['--main-thread', '--original', '--webgpu'].includes(arg))?.slice(2) ?? 'worker'
    await writeFile(`supabase/.temp/ocr-browser-report-${process.env.TEST_MOBILE === '1' ? 'mobile' : 'desktop'}-${variant}.json`, JSON.stringify(report, null, 2))
    console.log('PASS local OCR with external network blocked:', JSON.stringify(report))
    if (process.argv.includes('--cancel')) {
      page.once('dialog', dialog => dialog.accept())
      await page.getByRole('button', { name: 'Lancer la reconnaissance' }).click()
      await page.getByRole('status').filter({ hasText: /Reconnaissance en cours/ }).waitFor()
      await page.getByRole('button', { name: 'Réinitialiser et interrompre', exact: true }).click()
      await page.getByRole('status').filter({ hasText: 'En attente de fichier ou de texte.' }).waitFor()
      assert.equal(await page.locator('section[aria-label="Sources de la recette"] ol > li').count(), 0)
      console.log('PASS reset during active recognition: worker terminated, source/preview/text/draft cleared')
    }
    await page.getByRole('button', { name: 'Réinitialiser', exact: true }).click()
    assert.equal(await page.getByLabel('Transcription fusionnée à corriger', { exact: true }).inputValue(), '')
    assert.deepEqual(errors, [], 'No asynchronous cleanup errors after reset')
  }
  await context.close()
} finally { await browser.close() }
}
await run()
