import test from 'node:test';
import assert from 'node:assert/strict';
import {tagCalendarFailure,reportCalendarFailure} from './calendar-diagnostics.js';
test('diagnostics allow only fixed fields, never raw error text or arbitrary metadata',()=>{
 const secret=new Error('secret token phone');secret.code='SECRET';secret.stack='private stack';secret.headers={Authorization:'private'};
 const tagged=tagCalendarFailure(new Error('safe'),'private phase',secret,Infinity);
 assert.deepEqual(reportCalendarFailure(tagged,()=>{}),{event:'booking_calendar_failure',phase:'cache_validation',sourceCode:'UNCLASSIFIED'});
 assert.deepEqual(JSON.parse(JSON.stringify(tagged)),{});
 assert.equal(tagCalendarFailure(null,'google_token'),null);
 assert.equal(reportCalendarFailure(null,()=>{}).phase,'cache_validation');
});
test('upstream status survives safe wrapping without exposing payloads',()=>{
 const original=Object.assign(new Error('private'),{code:'CALENDAR_AUTH'});
 tagCalendarFailure(original,'google_token',original,503);
 const wrapped=tagCalendarFailure(new Error('generic'),'cache_provider',original);
 assert.deepEqual(reportCalendarFailure(wrapped,()=>{}),{event:'booking_calendar_failure',phase:'google_token',sourceCode:'CALENDAR_AUTH',upstreamStatus:503});
});
