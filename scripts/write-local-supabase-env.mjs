import { execFileSync } from "node:child_process"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"

const root = process.cwd()
const target = path.join(root, ".env.development.local")
const require = createRequire(import.meta.url)
const cli = path.join(path.dirname(require.resolve("supabase/package.json")), "dist", "supabase.js")
let values
try {
  const output = execFileSync(process.execPath, [cli, "status", "-o", "json"], {
    cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
  })
  values = JSON.parse(output)
} catch {
  // An execFileSync error contains stdout, potentially including local secrets.
  throw new Error("Statut Supabase local indisponible. Démarre Docker et npx supabase start, puis réessaie.")
}
const required = ["API_URL", "ANON_KEY", "SERVICE_ROLE_KEY"]
if (!required.every(key => values[key])) throw new Error("Supabase n'a pas retourné les variables locales attendues.")
const apiUrl = new URL(values.API_URL)
if (apiUrl.protocol !== 'http:' || apiUrl.username || apiUrl.password
  || !["127.0.0.1", "localhost"].includes(apiUrl.hostname)) {
  throw new Error("Configuration refusée : Supabase doit désigner l'instance locale.")
}

const updates = {
  NEXT_PUBLIC_SUPABASE_URL: values.API_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: values.ANON_KEY,
  NEXT_PUBLIC_SUPABASE_RECIPES_TABLE: "recipes",
  SUPABASE_SERVICE_ROLE_KEY: values.SERVICE_ROLE_KEY,
}
const existing = existsSync(target) ? readFileSync(target, "utf8") : ""
const lines = existing.split(/\r?\n/).filter(line => line && !Object.keys(updates).some(key => line.startsWith(`${key}=`)))
for (const [key, value] of Object.entries(updates)) lines.push(`${key}=${value}`)
writeFileSync(target, `${lines.join("\n")}\n`)
console.log(".env.development.local configuré pour Supabase local (Auth, catalogue et Storage).")
console.log("Les valeurs de .env.local sont conservées. Redémarre npm run dev pour appliquer le changement.")
