import { handleReceipt } from '../../../server/booking-receipts.js';
import { withBookingDiagnostics } from "../../../server/booking-diagnostics.js";

export const onRequest = withBookingDiagnostics("receipt", (request, env) => handleReceipt(request, env));
