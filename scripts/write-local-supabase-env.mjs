import { execFileSync } from "node:child_process"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

const root = process.cwd()
const target = path.join(root, ".env.local")
const cli = path.join(root, "node_modules", "supabase", "bin", process.platform === "win32" ? "supabase.exe" : "supabase")
const output = execFileSync(cli, ["status", "-o", "env"], { cwd: root, encoding: "utf8" })

const values = Object.fromEntries([...output.matchAll(/^([A-Z_]+)=(?:"([^"]*)"|(.*))$/gm)].map(([, key, quoted, plain]) => [key, quoted ?? plain]))
const required = ["API_URL", "ANON_KEY", "SERVICE_ROLE_KEY"]
if (!required.every(key => values[key])) throw new Error("Supabase n'a pas retourné les variables locales attendues.")

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
console.log(".env.local configuré pour Supabase local.")
