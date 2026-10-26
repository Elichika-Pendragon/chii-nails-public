import { salon } from './content.js';

const stamp = date => date.toISOString().replace(/[-:]|\.\d{3}/g, '');
const escapeText = text => text.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
function fold(line) {
  let bytes=0, result='';
  for (const char of line) {
    const size=new TextEncoder().encode(char).length;
    if (bytes+size>75) {result+='\r\n ';bytes=1;}
    result+=char;bytes+=size;
  }
  return result;
}

// A customer calendar copy contains no name, phone, money, receipt capability or owner token.
export function receiptCalendar(item, now = Date.now()) {
  if (item?.status!=='accepted' || !/^CHII-[A-F0-9-]{36}$/i.test(item.number||'')) return null;
  const start=new Date(item.startISO),end=new Date(item.endISO),created=new Date(now);
  if (![start,end,created].every(date=>Number.isFinite(date.getTime())) || start<=created || end<=start || end-start>5*3600000) return null;
  const title='Nail appointment · Chii Nails';
  const location=`Demo studio, ${salon.address}`;
  const description=`Booking telah dikonfirmasi Chii. Jadwal dalam WIB. Hubungi Chii melalui WhatsApp untuk perubahan. Petunjuk arah: ${salon.directions}`;
  const calendar=new URL('https://calendar.google.com/calendar/render');
  for (const [key,value] of Object.entries({action:'TEMPLATE',text:title,dates:`${stamp(start)}/${stamp(end)}`,ctz:'Asia/Jakarta',location,details:description})) calendar.searchParams.set(key,value);
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Chii Nails//Customer appointment//ID','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT',`UID:${item.number.toLowerCase()}@studio.example`,`DTSTAMP:${stamp(created)}`,`DTSTART:${stamp(start)}`,`DTEND:${stamp(end)}`,`SUMMARY:${escapeText(title)}`,`LOCATION:${escapeText(location)}`,`DESCRIPTION:${escapeText(description)}`,'STATUS:CONFIRMED','TRANSP:OPAQUE'];
  for (const trigger of ['-P1D','-PT2H']) lines.push('BEGIN:VALARM',`TRIGGER:${trigger}`,'ACTION:DISPLAY','DESCRIPTION:Pengingat nail appointment Chii Nails','END:VALARM');
  lines.push('END:VEVENT','END:VCALENDAR');
  return {googleUrl:calendar.href,ics:lines.map(fold).join('\r\n')+'\r\n',fileName:'chii-nails-appointment.ics'};
}
