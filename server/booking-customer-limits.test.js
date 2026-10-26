import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {withCustomerRequestLimits} from './booking-customer-limits.js';
import {createBookingRequest} from './booking-requests.js';
import {createBookingHttpHandlers} from './booking-http.js';
import {retiredBookingAccess} from './retired-booking-access.js';
import {syntheticAdmission,syntheticNormalization} from './fixtures/synthetic-admission.js';
import {proof} from './fixtures/payment-proof.js';
const now=Date.parse('2026-10-23T02:00:00Z');
class D1 {
 constructor(){this.sqlite=new DatabaseSync(':memory:');for(const file of ['0001-booking','0002-booking-payment','0003-booking-duration','0004-booking-payment-proofs','0005-booking-calendar-sync-index','0006-booking-manual-payment','0010-booking-access-codes'])this.sqlite.exec(readFileSync(new URL(`../migrations/${file}.sql`,import.meta.url),'utf8'));}
 prepare(sql){const db=this.sqlite;return {sql,values:[],bind(...values){return {...this,values};},async first(){return db.prepare(this.sql).get(...this.values)||null;},async all(){return {results:db.prepare(this.sql).all(...this.values)};},async run(){return {success:true,meta:{changes:Number(db.prepare(this.sql).run(...this.values).changes)}};}};}
 async batch(statements){this.sqlite.exec('BEGIN');try{const result=statements.map(s=>({success:true,meta:{changes:Number(this.sqlite.prepare(s.sql).run(...s.values).changes)}}));this.sqlite.exec('COMMIT');return result;}catch(error){this.sqlite.exec('ROLLBACK');throw error;}}
}
function fixture(){const db=new D1();return {db,env:{SITE_URL:'https://synthetic.example',BOOKING_DB:db,BOOKING_LINK_SECRET:'synthetic-test-signing-secret-over-32-bytes',BOOKING_OWNER_EMAIL:'owner.synthetic@example.com'}};}
const input=(key,whatsapp='081234567890')=>({name:'Synthetic Customer',whatsapp,agreedPrice:'100000',paymentMode:'deposit',deposit:'20000',designType:'simple',durationMinutes:'120',date:'2026-10-24',time:'10:00',idempotencyKey:key,proof});
const calendar={async availability(){return {busyIntervals:[]};},async verifyCalendarWriteAccess(){return true;},async readAppointmentState(){return {state:'active'};}};
const submit=(f,key,at=now,phone,normal=syntheticNormalization)=>createBookingRequest(f.env,input(key,phone),{now:()=>at,calendar,admission:withCustomerRequestLimits(f.env,phone||'081234567890',syntheticAdmission,{now:()=>at}),normalizeProof:normal});
const count=(f,table)=>f.db.sqlite.prepare(`SELECT count(*) n FROM ${table}`).get().n;
test('a new phone submits without an owner-issued code and creates only a pending request',async()=>{
 const f=fixture(),result=await submit(f,'synthetic-public-request-001');assert.equal(result.status,'pending');
 assert.equal(count(f,'booking_requests'),1);assert.equal(count(f,'booking_payment_proofs'),1);
 for(const table of ['booking_access_codes','booking_code_requests','booking_slot_claims'])assert.equal(count(f,table),0);
});
test('an unverified phone cannot lock a different admitted visitor in any booking state',async()=>{
 for(const status of ['pending','approving','reconcile','accepted','cancelled','expired']){
  const f=fixture();await submit(f,'synthetic-active-request-001');f.db.sqlite.prepare("UPDATE booking_requests SET status=?,calendar_event_id='synthetic-event'").run(status);
  const result=await submit(f,'synthetic-active-request-002',now+900001);assert.equal(result.status,'pending');assert.equal(count(f,'booking_requests'),2);
 }
});
test('customer wrapper preserves the signed admission gate and its errors',async()=>{
 const f=fixture();let calls=0;
 const gate={async authorizeNew(){calls++;throw Object.assign(new Error('budget'),{code:'ADMISSION_CAPACITY'});}};
 const wrapped=withCustomerRequestLimits(f.env,'081234567890',gate);assert.equal(wrapped,gate);
 await assert.rejects(wrapped.authorizeNew({}),e=>e.code==='ADMISSION_CAPACITY');assert.equal(calls,1);
});

test('different phones have independent customer limits',async()=>{
 const f=fixture();await submit(f,'synthetic-phone-request-001');await submit(f,'synthetic-phone-request-002',now,'081234567891');assert.equal(count(f,'booking_requests'),2);
});
test('independently admitted same-phone requests cannot deny one another',async()=>{
 const f=fixture();let waiting=0,release;const ready=new Promise(resolve=>release=resolve);
 const normal=async(env,source,ticket)=>{if(++waiting===2)release();await ready;return syntheticNormalization(env,source,ticket);};
 const result=await Promise.allSettled([submit(f,'synthetic-race-request-001',now,undefined,normal),submit(f,'synthetic-race-request-002',now,undefined,normal)]);
 assert.equal(result.filter(x=>x.status==='fulfilled').length,2);
 assert.equal(count(f,'booking_requests'),2);assert.equal(count(f,'booking_payment_proofs'),2);
});
test('an uncertain-response retry returns the immutable original without consuming another request',async()=>{
 const f=fixture(),a=await submit(f,'synthetic-idempotent-request-001');const b=await submit(f,'synthetic-idempotent-request-001');assert.equal(a.requestId,b.requestId);assert.equal(count(f,'booking_requests'),1);
});
test('invalid input and unavailable storage fail closed without issuing any credential',async()=>{
 const f=fixture();assert.throws(()=>withCustomerRequestLimits(f.env,'invalid',syntheticAdmission),e=>e.code==='BOOKING_INPUT');
 assert.throws(()=>withCustomerRequestLimits({},'081234567890',syntheticAdmission),e=>e.code==='BOOKING_CONFIG');
 const broken=withCustomerRequestLimits(f.env,'081234567890',{async authorizeNew(){throw Object.assign(Error('synthetic storage'),{code:'BOOKING_STORAGE'});}});
 await assert.rejects(broken.authorizeNew({}),e=>e.code==='BOOKING_STORAGE');assert.equal(count(f,'booking_requests'),0);
});
test('existing private-code rows cannot act as an invitation requirement or block valid public submissions',async()=>{
 const f=fixture();f.db.sqlite.prepare('INSERT INTO booking_access_codes(id,whatsapp,customer_name,code_hash,created_at,updated_at,revoked_at) VALUES(?,?,?,?,?,?,?)').run('legacy-owner-code','6281234567890','Old customer','0'.repeat(64),now,now,now);
 await submit(f,'synthetic-legacy-request-001');assert.equal(count(f,'booking_access_codes'),1);assert.equal(count(f,'booking_code_requests'),0);
});
test('the production HTTP handler accepts a code-free request through real customer admission and SQLite',async()=>{
 const f=fixture();let events=0;
 const provider={...calendar,async createApprovedAppointment(){events++;},async reconcileApprovedAppointment(){},async readAppointmentState(){},async verifyCalendarWriteAccess(){}};
 const handlers=createBookingHttpHandlers({now:()=>now,isSubmissionEnabled:()=>true,preflightBookingAdmission:async()=>({}),submissionAdmission:()=>syntheticAdmission,createGoogleCalendarProvider:()=>provider,createBookingRequest:(env,body,options)=>createBookingRequest(env,body,{...options,normalizeProof:syntheticNormalization})});
 const send=(key,legacyCode)=>{const data=input(key);delete data.proof;data.turnstileToken='synthetic';if(legacyCode)data.bookingCode=legacyCode;const form=new FormData();form.set('booking',JSON.stringify(data));form.set('proof',new Blob([Buffer.from(proof.base64,'base64')],{type:'image/jpeg'}),'receipt.jpg');return handlers.requests(new Request(`${f.env.SITE_URL}/api/booking/requests`,{method:'POST',headers:{Origin:f.env.SITE_URL},body:form}),f.env);};
 const first=await send('synthetic-http-public-001');assert.equal(first.status,201);assert.equal((await first.json()).status,'pending');
 const busy=await send('synthetic-http-public-002','A7B2C');assert.equal(busy.status,201);assert.equal((await busy.json()).status,'pending');assert.equal(events,0);
});
test('retired access-code endpoints tell cached forms to refresh and expose no customer data',async()=>{
 const response=retiredBookingAccess();assert.equal(response.status,409);assert.equal((await response.json()).code,'BOOKING_UPDATE_REQUIRED');assert.equal(response.headers.get('Cache-Control'),'private, no-store');
});
