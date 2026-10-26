/** Server-only bounded diagnostics. Never log exceptions, URLs, headers or payloads. */
const phases=new Set(['cache_validation','cache_read','cache_payload','cache_future_expiry','cache_cooldown','cache_lease','cache_wait','cache_wait_timeout','cache_generation','cache_provider','cache_timeout','cache_intervals','cache_lease_expired','cache_publish','cache_publish_superseded','cache_publish_expired','google_token','google_calendar']);
const codes=new Set(['CALENDAR_CONFIG','CALENDAR_INPUT','CALENDAR_AUTH','CALENDAR_TIMEOUT','CALENDAR_UNAVAILABLE','CALENDAR_RESPONSE','CALENDAR_CONFLICT']);
const details=new WeakMap();
export function tagCalendarFailure(error,phase,cause=error,status){
 if(!error||typeof error!=='object')return error;
 const prior=cause&&typeof cause==='object'?details.get(cause):null;
 details.set(error,prior??Object.freeze({phase:phases.has(phase)?phase:'cache_validation',sourceCode:codes.has(cause?.code)?cause.code:'UNCLASSIFIED',...(Number.isInteger(status)&&status>=100&&status<=599?{upstreamStatus:status}:{})}));
 return error;
}
export function sanitizeCalendarDiagnostic(record) {
 if (!record || !phases.has(record.phase)) return {};
 return {phase:record.phase,sourceCode:codes.has(record.sourceCode)?record.sourceCode:'UNCLASSIFIED',
  ...(Number.isInteger(record.upstreamStatus)&&record.upstreamStatus>=100&&record.upstreamStatus<=599?{upstreamStatus:record.upstreamStatus}:{})};
}
export function reportCalendarFailure(error,report=console.warn){
 const detail=error&&typeof error==='object'?details.get(error):null;
 const record=Object.freeze({event:'booking_calendar_failure',...(detail??{phase:'cache_validation',sourceCode:'UNCLASSIFIED'})});
 try{report(record);}catch{/* Diagnostics must never replace the original failure. */}
 return record;
}
