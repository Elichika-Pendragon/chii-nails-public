import { forwardBookingSubmission } from '../../../server/booking-processor.js';

import { withBookingDiagnostics } from "../../../server/booking-diagnostics.js";

export const onRequest = withBookingDiagnostics("requests", forwardBookingSubmission);
