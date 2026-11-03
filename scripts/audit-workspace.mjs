// Read-only inventory: no file contents or credentials are written to the report.
import { readdirSync, statSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import ts from 'typescript'

const root = process.cwd()
const tracked = new Set(execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean))
const groups = new Map()
const files = []
const unreadable = []
function walk(directory) {
  let entries
  try { entries = readdirSync(path.join(root, directory), { withFileTypes: true }) }
  catch (error) { unreadable.push({ path: directory, code: error.code }); return }
  for (const entry of entries) {
    const relative = path.posix.join(directory, entry.name)
    if (entry.isSymbolicLink()) continue
    if (entry.isDirectory()) walk(relative)
    else {
      const size = statSync(path.join(root, relative)).size
      const group = relative.includes('/') ? relative.split('/')[0] : '(racine)'
      const summary = groups.get(group) ?? { files: 0, bytes: 0, tracked: 0 }
      summary.files++; summary.bytes += size; summary.tracked += Number(tracked.has(relative))
      groups.set(group, summary)
      files.push({ path: relative, bytes: size, tracked: tracked.has(relative) })
    }
  }
}
walk('')

const sources = files.filter(file => /^(app|components|hooks|lib|scripts)\//.test(file.path) && /\.(tsx?|m?js)$/.test(file.path))
const imports = new Map()
const packages = new Map()
for (const file of sources) {
  const content = readFileSync(path.join(root, file.path), 'utf8')
  const names = ts.preProcessFile(content, true, true).importedFiles.map(item => item.fileName)
  const edges = []
  for (const name of names) {
    if (name.startsWith('@/') || name.startsWith('.')) {
      const base = name.startsWith('@/') ? name.slice(2) : path.posix.normalize(path.posix.join(path.posix.dirname(file.path), name))
      const match = [base, ...['.ts', '.tsx', '.js', '.mjs', '/index.ts', '/index.tsx'].map(ext => base + ext)].find(candidate => sources.some(source => source.path === candidate))
      if (match) edges.push(match)
    } else if (!name.startsWith('node:')) {
      const pkg = name.startsWith('@') ? name.split('/').slice(0, 2).join('/') : name.split('/')[0]
      packages.set(pkg, [...packages.get(pkg) ?? [], file.path])
    }
  }
  imports.set(file.path, edges)
}
const reached = new Set()
function visit(file) {
  if (reached.has(file)) return
  reached.add(file)
  for (const dependency of imports.get(file) ?? []) visit(dependency)
}
sources.filter(file => file.path.startsWith('app/') || file.path.startsWith('scripts/')).forEach(file => visit(file.path))
const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'))
const manifest = JSON.parse(readFileSync('package.json', 'utf8'))
console.log(JSON.stringify({
  unreadable,
  totals: { files: files.length, bytes: files.reduce((sum, file) => sum + file.bytes, 0), tracked: tracked.size, lockPackages: Object.keys(lock.packages).length },
  groups: Object.fromEntries([...groups].sort((a, b) => b[1].bytes - a[1].bytes)),
  largest: files.filter(file => !/^(node_modules|\.git|\.next)\//.test(file.path)).sort((a, b) => b.bytes - a.bytes).slice(0, 12),
  unreachableCandidates: sources.filter(file => !reached.has(file.path)),
  dependencyReferences: Object.fromEntries(Object.keys(manifest.dependencies).map(name => [name, packages.get(name) ?? []])),
}, null, 2))
