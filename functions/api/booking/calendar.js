import { handleBookingCalendarMonth } from '../../../server/booking-http.js';

import { withBookingDiagnostics } from "../../../server/booking-diagnostics.js";

export const onRequest = withBookingDiagnostics("calendar", handleBookingCalendarMonth);
