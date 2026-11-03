import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {parseEnv} from 'node:util'
import {createClient} from '@supabase/supabase-js'
const env=parseEnv(readFileSync('.env.development.local','utf8'))
assert.ok(['localhost','127.0.0.1'].includes(new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname))
const options={auth:{persistSession:false,autoRefreshToken:false}}
const admin=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY,options)
const client=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.NEXT_PUBLIC_SUPABASE_ANON_KEY,options)
let recoveryEvent=false
client.auth.onAuthStateChange(event=>{if(event==='PASSWORD_RECOVERY') recoveryEvent=true})
const email=`recovery-${crypto.randomUUID()}@example.test`, password=`Aa1!${crypto.randomUUID()}`
let id
try {
 const created=await admin.auth.admin.createUser({email,password,email_confirm:true}); assert.ifError(created.error); id=created.data.user.id
 assert.ifError((await client.auth.signInWithPassword({email,password})).error)
 let claims=await client.auth.getClaims(); assert.ifError(claims.error); assert.ok(!claims.data.claims.amr.some(x=>x.method==='recovery'))
 await client.auth.signOut()
 const link=await admin.auth.admin.generateLink({type:'recovery',email}); assert.ifError(link.error)
 const verified=await client.auth.verifyOtp({type:'recovery',token_hash:link.data.properties.hashed_token}); assert.ifError(verified.error)
 claims=await client.auth.getClaims(); assert.ifError(claims.error); assert.ok(claims.data.claims.amr.some(x=>x.method==='otp'))
 assert.equal(recoveryEvent,true)
 const newPassword=`Aa2!${crypto.randomUUID()}`
 assert.ifError((await client.auth.updateUser({password:newPassword})).error)
 await client.auth.signOut()
 assert.ok((await client.auth.signInWithPassword({email,password})).error)
 assert.ifError((await client.auth.signInWithPassword({email,password:newPassword})).error)
 const used=await client.auth.verifyOtp({type:'recovery',token_hash:link.data.properties.hashed_token}); assert.ok(used.error)
 await client.auth.signOut()
 console.log('PASS: ordinary session denied recovery evidence; recovery JWT; password update; old password rejected; new password accepted; used token rejected; logout.')
} finally { if(id) assert.ifError((await admin.auth.admin.deleteUser(id)).error) }
