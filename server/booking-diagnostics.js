import { sanitizeCalendarDiagnostic } from './calendar-diagnostics.js';

const endpoints = new Set(['calendar','availability','requests','admission','proof','review','session','receipt','receipt-issue','settle','diagnostic-probe']);
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;

/** Rebuild the record at the private RPC boundary; arbitrary fields never reach storage. */
export function sanitizeBookingDiagnostic(value) {
  if (!value || !endpoints.has(value.endpoint) || typeof value.reference !== 'string' || !uuid.test(value.reference)
    || !Number.isInteger(value.status) || value.status < 500 || value.status > 599) return null;
  return Object.freeze({event:'booking_server_failure',endpoint:value.endpoint,reference:value.reference,status:value.status,
    elapsedMs:Number.isFinite(value.elapsedMs)?Math.max(0,Math.min(300000,Math.round(value.elapsedMs))):0,
    phase:'http_response',sourceCode:'UNCLASSIFIED',...sanitizeCalendarDiagnostic(value)});
}

export function recordBookingDiagnostic(value, log = console.warn) {
  const record = sanitizeBookingDiagnostic(value);
  if (!record) return false;
  log({...record,recordedAt:new Date().toISOString()});
  return true;
}

/** Preserve the request stream and response; never inspect bodies, URLs, tokens or errors. */
export function withBookingDiagnostics(endpoint, handler) {
  if (!endpoints.has(endpoint)) throw new TypeError('Unknown diagnostic endpoint');
  return async context => {
    const started = Date.now();
    let detail;
    const reportFailure = record => { detail = sanitizeCalendarDiagnostic(record); };
    const retain = status => {
      const reference = crypto.randomUUID();
      const record = sanitizeBookingDiagnostic({endpoint,reference,status,elapsedMs:Date.now()-started,...detail});
      const delivery = Promise.resolve().then(() => context.env.BOOKING_PROCESSOR.getByName('diagnostics-v1').recordDiagnostic(record))
        .then(accepted => { if (accepted !== true) throw new Error('Diagnostic rejected'); })
        .catch(() => { console.warn({...record,event:'booking_diagnostic_delivery_failed'}); });
      // Pages keeps this work alive after returning the response. A missing/broken
      // diagnostic binding must never turn a successful action into a failed one.
      try { context.waitUntil(delivery); } catch { /* delivery already has a rejection handler */ }
      return reference;
    };
    let response;
    try { response = await handler(context.request,context.env,{reportFailure}); }
    catch (error) { retain(500); throw error; }
    if (response.status < 500) return response;
    const reference = retain(response.status);
    const headers = new Headers(response.headers);
    headers.set('X-Booking-Incident',reference);
    return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
  };
}
