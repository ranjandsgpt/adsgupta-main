"use strict";
/**
 * OpenRTB 2.6 core type definitions used by the exchange when
 * communicating with DSPs. These interfaces intentionally focus
 * on the fields we need for a web display (banner + native) MVP.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoBidReason = void 0;
/**
 * OpenRTB 2.x no-bid reason codes. These are useful both for
 * debugging demand issues and for quality/traffic analysis.
 */
var NoBidReason;
(function (NoBidReason) {
    NoBidReason[NoBidReason["Unknown"] = 0] = "Unknown";
    NoBidReason[NoBidReason["TechnicalError"] = 1] = "TechnicalError";
    NoBidReason[NoBidReason["InvalidRequest"] = 2] = "InvalidRequest";
    NoBidReason[NoBidReason["KnownWebSpider"] = 3] = "KnownWebSpider";
    NoBidReason[NoBidReason["SuspectedNonHuman"] = 4] = "SuspectedNonHuman";
    NoBidReason[NoBidReason["DataCenterIP"] = 5] = "DataCenterIP";
    NoBidReason[NoBidReason["UnsupportedDevice"] = 6] = "UnsupportedDevice";
    NoBidReason[NoBidReason["BlockedPublisher"] = 7] = "BlockedPublisher";
    NoBidReason[NoBidReason["UnmatchedUser"] = 8] = "UnmatchedUser";
    NoBidReason[NoBidReason["InsufficientAuctionTime"] = 10] = "InsufficientAuctionTime";
})(NoBidReason || (exports.NoBidReason = NoBidReason = {}));
