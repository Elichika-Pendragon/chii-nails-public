import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {receiptCalendar} from '../src/receipt-calendar.js';
import {BOOKING_DESIGNS,LEGACY_BOOKING_DESIGN_LABELS} from './booking.js';
import {rupiah} from '../src/pricing.js';
const source=readFileSync(new URL('../src/scripts/receipt-client.js',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'');
const flush=()=>new Promise(resolve=>setTimeout(resolve,0));
function fixture(status='accepted'){
 const nodes=Object.fromEntries([...source.matchAll(/getElementById\('([^']+)'\)/g)].map(x=>[x[1],{hidden:true,disabled:false,textContent:'',listeners:{},addEventListener(k,f){this.listeners[k]=f;},removeAttribute(k){delete this[k];}}]));
 const fields=Object.fromEntries(['name','date','time','design','total','paid','balance'].map(name=>[name,{dataset:{receipt:name},textContent:''}]));
 const root={setAttribute(){},querySelectorAll(){return Object.values(fields);}};const blobs=[],revoked=[],window={listeners:{},prints:0,addEventListener(k,f){this.listeners[k]=f;},print(){this.prints++;}};
 const item={status,number:'CHII-00000000-0000-4000-A000-000000000001',name:'Synthetic Customer',agreedPrice:100000,deposit:30000,remainingBalance:70000,paidAmount:30000,amountDue:status==='cancelled'?null:70000,startISO:new Date(Date.now()+86400000).toISOString(),endISO:new Date(Date.now()+93600000).toISOString(),designType:'simple',paymentPolicy:'manual-min20k-v3'};
 class MockURL extends URL {static createObjectURL(blob){blobs.push(blob);return 'blob:synthetic-'+blobs.length;}static revokeObjectURL(url){revoked.push(url);}}
 vm.runInNewContext(source,{document:{querySelector(){return root;},getElementById(id){return nodes[id];}},location:{hash:'#r=00000000-0000-4000-a000-000000000001.'+'a'.repeat(43)},fetch:async()=>({ok:true,json:async()=>({receipt:item})}),window,URL:MockURL,URLSearchParams,AbortController,setTimeout,clearTimeout,Intl,Date,Blob,BOOKING_DESIGNS,LEGACY_BOOKING_DESIGN_LABELS,rupiah,receiptCalendar});
 return {nodes,fields,blobs,revoked,window};
}
test('accepted receipt exposes calendar actions without automatic printing or event creation',async()=>{
 const f=fixture();await flush();assert.equal(f.nodes['receipt-calendar'].hidden,false);assert.match(f.nodes['receipt-calendar-google'].href,/^https:\/\/calendar.google.com\/calendar\/render/);assert.equal(f.blobs.length,1);assert((await f.blobs[0].text()).includes('TRIGGER:-P1D'));assert.equal(f.window.prints,0);assert.equal(f.nodes['receipt-print'].disabled,false);assert.equal(f.nodes['receipt-appointment-state'].textContent,'Booking terkonfirmasi');
});
test('cancelled receipt has historical schedule text and no calendar URLs or reminders',async()=>{
 const f=fixture('cancelled');await flush();assert(f.nodes['receipt-calendar'].hidden);assert.equal(f.nodes['receipt-calendar-google'].href,undefined);assert.equal(f.blobs.length,0);assert.equal(f.nodes['receipt-appointment-state'].textContent,'Jadwal yang dibatalkan');assert(f.nodes['receipt-balance-row'].hidden);
});
test('leaving the receipt clears calendar links and revokes the temporary calendar download',async()=>{
 const f=fixture();await flush();f.window.listeners.pagehide();assert(f.nodes['receipt-calendar'].hidden);assert.equal(f.nodes['receipt-calendar-file'].href,undefined);assert.equal(f.revoked.length,1);assert(f.nodes['receipt-print'].disabled);
});

test('receipt navigation invalidates old response and restores fresh settlement, 100 cycles',async()=>{
 for(let i=0;i<100;i++){
 const nodes=Object.fromEntries([...source.matchAll(/getElementById\('([^']+)'\)/g)].map(x=>[x[1],{hidden:true,disabled:false,textContent:'',listeners:{},addEventListener(k,f){this.listeners[k]=f;},removeAttribute(k){delete this[k];}}]));
 const root={setAttribute(){},querySelectorAll(){return [];}};const window={listeners:{},addEventListener(k,f){this.listeners[k]=f;},print(){}};const releases=[];let calls=0;
 const item={status:'accepted',number:'CHII-00000000-0000-4000-A000-000000000001',name:'Synthetic',agreedPrice:100000,deposit:30000,remainingBalance:70000,startISO:'2026-10-28T10:00:00+07:00',endISO:'2026-10-28T12:00:00+07:00',designType:'simple',paymentPolicy:'manual-min20k-v3'};
 class MockURL extends URL {static createObjectURL(){return 'blob:synthetic';}static revokeObjectURL(){}}
 vm.runInNewContext(source,{document:{querySelector(){return root;},getElementById(k){return nodes[k];}},location:{hash:'#r=00000000-0000-4000-a000-000000000001.'+'a'.repeat(43)},fetch:async()=>{const n=++calls;return{ok:true,json:()=>new Promise(resolve=>releases.push(()=>resolve({receipt:{...item,paidAmount:n===1?30000:100000,amountDue:n===1?70000:0}})))};},window,URL:MockURL,URLSearchParams,AbortController,setTimeout,clearTimeout,Intl,Date,Blob,BOOKING_DESIGNS,LEGACY_BOOKING_DESIGN_LABELS,rupiah,receiptCalendar});
 await flush();window.listeners.pagehide();window.listeners.pageshow({persisted:true});await flush();assert.equal(calls,2);
 releases[0]();await flush();assert(nodes['receipt-details'].hidden);assert(nodes['receipt-print'].disabled);
 releases[1]();await flush();assert.equal(nodes['receipt-state'].textContent,'Lunas');assert.equal(nodes['receipt-print'].disabled,false);window.listeners.pagehide();
 }
});
