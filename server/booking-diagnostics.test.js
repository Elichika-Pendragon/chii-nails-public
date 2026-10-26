import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sanitizeBookingDiagnostic,recordBookingDiagnostic,withBookingDiagnostics} from './booking-diagnostics.js';

const reference='12345678-1234-4234-8234-123456789abc';
const base={endpoint:'calendar',reference,status:503,elapsedMs:2001};
const fixture=()=>{
 const calls=[],pending=[];
 return {calls,pending,context:{request:new Request('https://synthetic.test/api/booking/calendar?secret=private',{method:'POST',headers:{Cookie:'private'},body:'private screenshot customer token'}),
  env:{SECRET:'private',BOOKING_PROCESSOR:{getByName(name){assert.equal(name,'diagnostics-v1');return {async recordDiagnostic(record){calls.push(record);return true;}};}}},
  waitUntil(promise){pending.push(promise);}}};
};

test('receiver keeps only bounded fields and server timestamp, never raw diagnostics or secrets',()=>{
 const logs=[];
 assert.equal(recordBookingDiagnostic({...base,phase:'google_calendar',sourceCode:'CALENDAR_UNAVAILABLE',upstreamStatus:503,
  event:'private',message:'private',headers:{Cookie:'private'},request:{phone:'private'},recordedAt:'private'},r=>logs.push(r)),true);
 assert.deepEqual(Object.keys(logs[0]).sort(),['elapsedMs','endpoint','event','phase','recordedAt','reference','sourceCode','status','upstreamStatus'].sort());
 assert.equal(logs[0].event,'booking_server_failure');assert.equal(logs[0].phase,'google_calendar');
 assert.equal(logs[0].upstreamStatus,503);assert.ok(Number.isFinite(Date.parse(logs[0].recordedAt)));
 assert.equal(JSON.stringify(logs).includes('private'),false);
});
test('invalid records are rejected; untrusted phase and code text cannot enter logs',()=>{
 for(const value of [null,{}, {...base,reference:'customer-phone'}, {...base,endpoint:'secret-path'}, {...base,status:200}, {...base,status:600}])assert.equal(sanitizeBookingDiagnostic(value),null);
 assert.deepEqual(sanitizeBookingDiagnostic({...base,phase:'private',sourceCode:'private',upstreamStatus:999}),{event:'booking_server_failure',...base,phase:'http_response',sourceCode:'UNCLASSIFIED'});
 assert.equal(sanitizeBookingDiagnostic({...base,phase:'google_token',sourceCode:'private'}).sourceCode,'UNCLASSIFIED');
 assert.equal(sanitizeBookingDiagnostic({...base,elapsedMs:Infinity}).elapsedMs,0);
 assert.equal(sanitizeBookingDiagnostic({...base,elapsedMs:999999}).elapsedMs,300000);
 assert.throws(()=>withBookingDiagnostics('secret-path',()=>{}));
});
test('success and expected client errors are untouched and do not generate retained logs',async()=>{
 for(const status of [200,201,204,400,401,403,404,405,409,410,413,429]){
  const {calls,pending,context}=fixture(),original=new Response(null,{status});
  const result=await withBookingDiagnostics('requests',()=>original)(context);
  assert.equal(result,original);assert.equal(calls.length,0);assert.equal(pending.length,0);assert.equal(context.request.bodyUsed,false);
 }
});
test('100 failures retain one record each, matching the response reference and original status/body/security headers',async()=>{
 const references=new Set();
 for(let i=0;i<100;i++){
  const {calls,pending,context}=fixture();
  const result=await withBookingDiagnostics('calendar',(request,env,{reportFailure})=>{
   assert.equal(request,context.request);assert.equal(env,context.env);
   reportFailure({phase:'google_calendar',sourceCode:'CALENDAR_UNAVAILABLE',upstreamStatus:503,message:'private'});
   return Response.json({code:'CALENDAR_UNAVAILABLE'},{status:503,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  })(context);
  assert.equal(pending.length,1);await Promise.all(pending);assert.equal(calls.length,1);
  assert.equal(result.status,503);assert.deepEqual(await result.json(),{code:'CALENDAR_UNAVAILABLE'});
  assert.equal(result.headers.get('Cache-Control'),'no-store');assert.equal(result.headers.get('X-Content-Type-Options'),'nosniff');
  assert.equal(result.headers.get('X-Booking-Incident'),calls[0].reference);references.add(calls[0].reference);
  assert.equal(calls[0].phase,'google_calendar');assert.equal(calls[0].upstreamStatus,503);
  assert.equal(context.request.bodyUsed,false);assert.equal(JSON.stringify(calls).includes('private'),false);
 }
 assert.equal(references.size,100);
});
test('waitUntil delivery does not block the HTTP response',async()=>{
 const {context,pending}=fixture();let finish;
 context.env.BOOKING_PROCESSOR={getByName:()=>({recordDiagnostic:()=>new Promise(resolve=>{finish=resolve;})})};
 const response=await withBookingDiagnostics('requests',()=>new Response(null,{status:503}))(context);
 assert.equal(response.status,503);assert.equal(typeof finish,'function');finish(true);await Promise.all(pending);
});
test('missing, rejecting or failing logger and broken waitUntil preserve the original failure',async()=>{
 const previous=console.warn,logs=[];console.warn=record=>logs.push(record);
 try{
  for(const mode of ['missing','throw','reject','refuse','waitUntil']){
   const {context,pending}=fixture();
   if(mode==='missing')delete context.env.BOOKING_PROCESSOR;
   if(mode==='throw')context.env.BOOKING_PROCESSOR={getByName(){throw new Error('private');}};
   if(mode==='reject')context.env.BOOKING_PROCESSOR={getByName:()=>({recordDiagnostic:async()=>{throw new Error('private');}})};
   if(mode==='refuse')context.env.BOOKING_PROCESSOR={getByName:()=>({recordDiagnostic:async()=>false})};
   if(mode==='waitUntil')context.waitUntil=promise=>{pending.push(promise);throw new Error('private');};
   const result=await withBookingDiagnostics('review',()=>Response.json({code:'BOOKING_UNAVAILABLE'},{status:503}))(context);
   await Promise.all(pending);assert.equal(result.status,503);assert.deepEqual(await result.json(),{code:'BOOKING_UNAVAILABLE'});
  }
  assert.equal(logs.length,4);assert.equal(JSON.stringify(logs).includes('private'),false);
 }finally{console.warn=previous;}
});
test('an uncaught handler exception is retained safely without replacing or serializing it',async()=>{
 const {calls,pending,context}=fixture(),original=new Error('private');
 await assert.rejects(withBookingDiagnostics('review',()=>{throw original;})(context),e=>e===original);
 await Promise.all(pending);assert.equal(calls.length,1);assert.equal(calls[0].status,500);assert.equal(JSON.stringify(calls).includes('private'),false);
});
test('concurrent requests do not share detailed diagnostic records',async()=>{
 const a=fixture(),b=fixture();let resume;
 const first=withBookingDiagnostics('calendar',async(r,e,{reportFailure})=>{reportFailure({phase:'google_token',sourceCode:'CALENDAR_AUTH',upstreamStatus:401});await new Promise(resolve=>{resume=resolve;});return new Response(null,{status:503});})(a.context);
 await withBookingDiagnostics('calendar',()=>new Response(null,{status:503}))(b.context);resume();await first;
 await Promise.all([...a.pending,...b.pending]);assert.equal(a.calls[0].phase,'google_token');assert.equal(b.calls[0].phase,'http_response');
});
test('all active booking action routes use diagnostics; receipt issue and settlement flags remain distinct',()=>{
 for(const endpoint of ['calendar','availability','requests','admission','proof','review','auth/session','receipt','receipt-issue','settle']){
  const source=readFileSync(new URL('../functions/api/booking/'+endpoint+'.js',import.meta.url),'utf8');assert.ok(source.includes('withBookingDiagnostics('));
  if(endpoint==='receipt-issue')assert.ok(source.includes('handleReceipt(request, env, {}, true)'));
  if(endpoint==='settle')assert.ok(source.includes('handleReceipt(request, env, {}, true, true)'));
 }
});
