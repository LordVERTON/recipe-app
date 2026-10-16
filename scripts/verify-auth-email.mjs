import assert from 'node:assert/strict'
import { authReturnUrl, PRODUCTION_ORIGIN } from '../lib/auth-redirects.ts'
import { notificationTransport } from '../lib/notification-transport.ts'
assert.equal(authReturnUrl('/auth/complete', PRODUCTION_ORIGIN, undefined, false), `${PRODUCTION_ORIGIN}/auth/complete`)
for (const origin of ['http://localhost:3000', 'https://evil.test', 'https://recipe-app-alpha-wine.vercel.app.evil.test']) assert.throws(() => authReturnUrl('/auth/complete', origin, undefined, false))
assert.equal(authReturnUrl('/auth/reset-password','http://localhost:3000',undefined,true),'http://localhost:3000/auth/reset-password')
assert.equal(authReturnUrl('/auth/complete','https://preview.example.test','https://preview.example.test',false),'https://preview.example.test/auth/complete')
assert.throws(() => notificationTransport({NODE_ENV:'production'}))
assert.throws(() => notificationTransport({NODE_ENV:'production', RECIPE_NOTIFICATION_EMAIL_ENABLED:'true'}))
const env = {NODE_ENV:'production',NEXT_PUBLIC_SUPABASE_URL:'https://project.example.test',RECIPE_NOTIFICATION_EMAIL_ENABLED:'true',MAILJET_API_KEY:'mock-key',MAILJET_SECRET_KEY:'mock-secret',MAILJET_FROM_EMAIL:'sender@example.test',RECIPE_REVIEW_NOTIFICATION_TO:'reviewer@example.test'}
assert.throws(() => notificationTransport({...env,VERCEL_ENV:'preview'}))
const bodies=[]
const send = notificationTransport(env, async (url, init) => {
 assert.equal(url,'https://api.mailjet.com/v3.1/send')
 const body=JSON.parse(init.body); bodies.push(body)
 assert.equal(body.Messages[0].To[0].Email,'reviewer@example.test')
 assert.equal(body.Messages[0].DeduplicateCampaign,true)
 assert.ok(body.Messages[0].TextPart.includes(PRODUCTION_ORIGIN))
 assert.ok(!body.Messages[0].TextPart.includes('localhost'))
 return Response.json({Messages:[{Status:'success'}]})
})
await send('recipe-1','Recette'); await send('recipe-1','Recette')
assert.equal(bodies[0].Messages[0].CustomCampaign,bodies[1].Messages[0].CustomCampaign)
for (const response of [new Response('',{status:429}),Response.json({Messages:[{Status:'error'}]}),Response.json({})]) await assert.rejects(notificationTransport(env,async()=>response)('recipe-1','Recette'))
await notificationTransport({NODE_ENV:'development',NEXT_PUBLIC_SUPABASE_URL:'http://127.0.0.1:54321'},async(url,init)=>{
 assert.equal(url,'http://127.0.0.1:54324/api/v1/send'); assert.ok(!init.headers.Authorization); return Response.json({})
})('local','Test')
console.log('PASS: redirects, environment gates, Mailjet success/errors/deduplication, local Mailpit. No external requests.')
