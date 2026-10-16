import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const config = readFileSync(new URL('../supabase/config.toml', import.meta.url), 'utf8')
const project = config.match(/^project_id\s*=\s*"([\w-]+)"/m)?.[1]
const port = config.match(/\[local_smtp\]\s+enabled\s*=\s*true\s+port\s*=\s*(\d+)/)?.[1]
const action = process.argv[2]
const run = (command, args, capture = false) => execFileSync(command, args, {
  cwd: root, encoding: 'utf8', stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
})

try {
  if (!project || !port) throw new Error('Configuration locale project_id/local_smtp manquante.')
  if (!['start', 'stop'].includes(action)) throw new Error('Usage: node scripts/mailpit.mjs start|stop')
  // The pinned Supabase CLI still names its Mailpit container "inbucket".
  const container = `supabase_inbucket_${project}`
  const containers = run('docker', ['ps', '-a', '--format', '{{.Names}}'], true).trim().split(/\r?\n/)
  if (action === 'stop') {
    if (containers.includes(container)) run('docker', ['stop', container])
    console.log('Mailpit arrêté. Les autres services Supabase restent disponibles.')
  } else {
    if (containers.includes(container)) run('docker', ['start', container])
    const running = run('docker', ['ps', '--format', '{{.Names}}'], true).trim().split(/\r?\n/)
    if (![container, `supabase_auth_${project}`, `supabase_kong_${project}`, `supabase_db_${project}`].every(name => running.includes(name))) {
      run(process.execPath, ['scripts/start-local-supabase.mjs'])
    }
    const inbox = `http://127.0.0.1:${port}`
    let ready = false
    for (let attempt = 0; attempt < 30; attempt++) {
      try {
        const response = await fetch(`${inbox}/api/v1/info`, { signal: AbortSignal.timeout(1000) })
        if (response.ok) { ready = true; break }
      } catch { /* Wait for the local container to become ready. */ }
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    if (!ready) throw new Error(`Mailpit ne répond pas sur ${inbox}.`)
    run(process.execPath, ['scripts/write-local-supabase-env.mjs'])
    console.log(`Mailpit prêt : ${inbox}. Lance ou redémarre npm run dev pour utiliser Supabase local.`)
  }
} catch (error) {
  console.error(`Mailpit : ${error.message}`)
  console.error('Vérifie que Docker Desktop est démarré et accessible.')
  process.exitCode = 1
}
