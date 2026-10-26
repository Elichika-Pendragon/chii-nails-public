/** A typed phone is contact information, not verified customer identity. */
import { normalizeWhatsApp } from './booking.js';
import { BookingRequestError } from './booking-requests.js';
export function withCustomerRequestLimits(env, whatsapp, admission) {
  if (!normalizeWhatsApp(whatsapp)) throw new BookingRequestError('BOOKING_INPUT',400,{whatsapp:true});
  if (typeof env?.BOOKING_DB?.prepare!=='function' || typeof admission?.authorizeNew!=='function') throw new BookingRequestError('BOOKING_CONFIG');
  // Signed-session, IP, challenge and atomic global budgets remain in admission.
  return admission;
}
