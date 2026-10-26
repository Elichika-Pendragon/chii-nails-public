import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {receiptCalendar} from '../src/receipt-calendar.js';
const now=Date.parse('2026-10-25T01:00:00Z');
const item={status:'accepted',number:'CHII-00000000-0000-4000-A000-000000000001',name:'Private Customer',whatsapp:'6281234567890',deposit:30000,agreedPrice:100000,startISO:'2026-10-26T10:00:00+07:00',endISO:'2026-10-26T12:00:00+07:00'};
test('customer calendar uses exact accepted appointment in UTC with explicit Jakarta display timezone',()=>{
 const event=receiptCalendar(item,now),url=new URL(event.googleUrl);
 assert.equal(url.origin,'https://calendar.google.com');assert.equal(url.searchParams.get('dates'),'20261026T030000Z/20261026T050000Z');assert.equal(url.searchParams.get('ctz'),'Asia/Jakarta');
 assert(event.ics.includes('DTSTART:20261026T030000Z\r\n'));assert(event.ics.includes('DTEND:20261026T050000Z\r\n'));assert(event.ics.includes('METHOD:PUBLISH'));
});
test('download includes two standard display reminders, valid CRLF and UTF-8 folded lines',()=>{
 const {ics}=receiptCalendar(item,now);assert.equal((ics.match(/BEGIN:VALARM/g)||[]).length,2);assert(ics.includes('TRIGGER:-P1D\r\n'));assert(ics.includes('TRIGGER:-PT2H\r\n'));
 assert(!/(?<!\r)\n/.test(ics));for(const line of ics.split('\r\n'))assert(new TextEncoder().encode(line).length<=75);
 assert.equal((ics.match(/BEGIN:VEVENT/g)||[]).length,1);assert(ics.includes('STATUS:CONFIRMED'));
});
test('calendar exports omit customer identity, prices and all private receipt/review capabilities',()=>{
 const event=receiptCalendar({...item,receiptUrl:'https://studio.example/receipt#r=PRIVATE',reviewUrl:'https://studio.example/book/approve?r=OWNER'},now);
 const text=event.googleUrl+event.ics;for(const value of ['Private Customer','6281234567890','agreedPrice','paidAmount','PRIVATE','OWNER','/receipt#','/book/approve'])assert(!text.includes(value));
 assert(event.ics.includes('UID:chii-00000000-0000-4000-a000-000000000001@studio.example'));
});
test('cancelled, pending, past or malformed appointments never offer a calendar reminder',()=>{
 for(const status of ['cancelled','pending','expired','approving'])assert.equal(receiptCalendar({...item,status},now),null);
 for(const change of [{number:'BAD\r\nATTENDEE:attacker@example.com'},{startISO:'invalid'},{endISO:item.startISO},{endISO:'2026-10-27T10:00:00+07:00'}])assert.equal(receiptCalendar({...item,...change},now),null);
 assert.equal(receiptCalendar(item,Date.parse('2026-10-27T01:00:00Z')),null);
});
test('receipt print keeps location and real calendar/directions links but hides the temporary calendar-file link',()=>{
 const html=readFileSync(new URL('../src/pages/receipt.astro',import.meta.url),'utf8'),css=readFileSync(new URL('../src/receipt.css',import.meta.url),'utf8');
 assert(html.includes('receipt-appointment-state'));assert(html.includes('{salon.address}'));assert(html.includes('href={salon.directions}'));
 assert.match(html,/<a id="receipt-calendar-file" class="receipt-screen-only"/);assert.match(html,/<a id="receipt-calendar-google" target/);assert(css.includes('.receipt-calendar .receipt-screen-only{display:none!important}'));
 for(const file of ['book.astro','book/approve.astro','prices.astro','receipt.astro'])assert(!readFileSync(new URL('../src/pages/'+file,import.meta.url),'utf8').includes('public-analytics'));
});
