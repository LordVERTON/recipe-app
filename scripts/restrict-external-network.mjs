// Optional Node test preload. Only this process and its Node children are
// affected; no Windows firewall, adapter, Docker network or global setting changes.
import net from 'node:net'
import dns from 'node:dns'
import { syncBuiltinESMExports } from 'node:module'
import { pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'

const allowed = host => !host || host === 'localhost' || host === '::1'
  || (net.isIPv4(host) && host.startsWith('127.'))
  || (host.startsWith('::ffff:') && net.isIPv4(host.slice(7)) && host.slice(7).startsWith('127.'))
function guard(host) {
  if (!allowed(host)) throw new Error(`External network blocked by loopback-only test: ${host}`)
}
const connect = net.Socket.prototype.connect
net.Socket.prototype.connect = function (...args) {
  const first = Array.isArray(args[0]) ? args[0][0] : args[0]
  if (typeof first === 'object') guard(first.host ?? first.hostname)
  else if (typeof first === 'number') guard(typeof args[1] === 'string' ? args[1] : undefined)
  return connect.apply(this, args)
}
const lookup = dns.lookup
dns.lookup = function (hostname, ...args) { guard(hostname); return lookup.call(this, hostname, ...args) }
const promiseLookup = dns.promises.lookup
dns.promises.lookup = async function (hostname, ...args) { guard(hostname); return promiseLookup.call(this, hostname, ...args) }
const fetch = globalThis.fetch
globalThis.fetch = function (input, init) {
  try { guard(new URL(typeof input === 'string' || input instanceof URL ? input : input.url).hostname) }
  catch (error) { return Promise.reject(error) }
  return fetch(input, init)
}
syncBuiltinESMExports()

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  assert.throws(() => net.connect(443, '203.0.113.1'), /External network blocked/)
  assert.throws(() => dns.lookup('example.invalid'), /External network blocked/)
  assert.throws(() => dns.lookup('127.example.invalid'), /External network blocked/)
  await assert.rejects(globalThis.fetch('https://example.invalid'), /External network blocked/)
  assert.equal((await globalThis.fetch('http://127.0.0.1:54324/api/v1/info')).status, 200)
  console.log('PASS: external TCP, DNS and fetch rejected; loopback HTTP available. No system network settings changed.')
}
