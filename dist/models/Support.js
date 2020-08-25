"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TicketInfo {
}
exports.TicketInfo = TicketInfo;
var TicketStatus;
(function (TicketStatus) {
    TicketStatus[TicketStatus["PendingSupportResponse"] = 1] = "PendingSupportResponse";
    TicketStatus[TicketStatus["PendingCustomerResponse"] = 2] = "PendingCustomerResponse";
    TicketStatus[TicketStatus["Closed"] = 3] = "Closed";
    TicketStatus[TicketStatus["StaffNeedMoreTimeBeforeResponse"] = 4] = "StaffNeedMoreTimeBeforeResponse";
})(TicketStatus = exports.TicketStatus || (exports.TicketStatus = {}));
class SupportTicketReply {
}
exports.SupportTicketReply = SupportTicketReply;
//# sourceMappingURL=Support.js.map