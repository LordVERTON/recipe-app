import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {parseEnv} from 'node:util'
import {createClient} from '@supabase/supabase-js'
import {chromium} from '@playwright/test'
const env=parseEnv(readFileSync('.env.development.local','utf8'))
assert.equal(new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname,'127.0.0.1')
const options={auth:{persistSession:false,autoRefreshToken:false}}
const admin=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY,options)
const client=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.NEXT_PUBLIC_SUPABASE_ANON_KEY,options)
let browser,id
try {
 browser=await chromium.launch({headless:true})
 const page=await browser.newPage({viewport:{width:390,height:844}})
 await page.goto('http://localhost:3000/privacy'); await page.getByRole('heading',{name:'Politique de confidentialité',exact:true}).waitFor()
 await page.goto('http://localhost:3000/auth/reset-password')
 await page.getByRole('status').filter({hasText:'Lien invalide'}).waitFor()
 assert.equal(await page.locator('input[type=password]').count(),0)
 await page.goto('http://localhost:3000/auth/complete#error=access_denied&error_code=otp_expired')
 await page.getByRole('status').filter({hasText:'Lien invalide'}).waitFor()
 assert.equal(new URL(page.url()).hash,'')
 const email=`browser-auth-${crypto.randomUUID()}@example.test`,password=`Aa1!${crypto.randomUUID()}`
 const created=await admin.auth.admin.createUser({email,password,email_confirm:true});assert.ifError(created.error);id=created.data.user.id
 const link=await admin.auth.admin.generateLink({type:'recovery',email});assert.ifError(link.error)
 const verified=await client.auth.verifyOtp({type:'recovery',token_hash:link.data.properties.hashed_token});assert.ifError(verified.error)
 const session=verified.data.session
 const fragment=new URLSearchParams({access_token:session.access_token,refresh_token:session.refresh_token,expires_in:'3600',token_type:'bearer',type:'recovery'})
 // Fragment never reaches the server; never log it or use traces/screenshots with tokens.
 await page.goto(`http://localhost:3000/auth/reset-password#${fragment}`)
 await page.getByLabel('Nouveau mot de passe',{exact:true}).waitFor()
 assert.equal(new URL(page.url()).hash,'')
 const nextPassword=`Bb2!${crypto.randomUUID()}`
 await page.getByLabel('Nouveau mot de passe',{exact:true}).fill(nextPassword)
 await page.getByLabel('Confirmer le mot de passe',{exact:true}).fill('different-password')
 await page.getByRole('button',{name:'Enregistrer le mot de passe'}).click()
 await page.getByRole('status').filter({hasText:'ne correspondent pas'}).waitFor()
 await page.getByLabel('Confirmer le mot de passe',{exact:true}).fill(nextPassword)
 await page.getByRole('button',{name:'Enregistrer le mot de passe'}).click()
 await page.getByRole('status').filter({hasText:'Mot de passe modifié'}).waitFor()
 await client.auth.signOut();assert.ifError((await client.auth.signInWithPassword({email,password:nextPassword})).error)
 await page.goto('http://localhost:3000/?account=1')
 await page.getByRole('button',{name:'Mot de passe oublié ?'}).first().click()
 await page.getByRole('button',{name:'Demander un lien'}).first().waitFor()
 console.log('PASS: mobile privacy, absent recovery session, invalid callback, valid recovery UI, mismatch, password update, fragment cleanup, forgotten-password entry.')
} finally {await browser?.close();if(id)assert.ifError((await admin.auth.admin.deleteUser(id)).error)}
