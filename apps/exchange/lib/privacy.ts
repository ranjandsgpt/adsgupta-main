// TCF 2.2 / regs — simplified consent signaling for auction + logging.

export interface ConsentInfo {
  gdprApplies: boolean;
  consentString?: string;
  hasConsent: boolean;
  purposeConsents: number[];
}

export function parseGdprConsent(regs: { gdpr?: number }, user: { consent?: string }): ConsentInfo {
  const gdprApplies = regs?.gdpr === 1;
  const consentString = user?.consent;
  return {
    gdprApplies,
    consentString,
    hasConsent: gdprApplies ? !!consentString : true,
    purposeConsents: gdprApplies && consentString ? [1, 2, 3, 4] : []
  };
}

export function parseUsp(regs: { us_privacy?: string }): { ccpaApplies: boolean; optedOut: boolean } {
  const usp = regs?.us_privacy;
  if (!usp || usp.length < 4) return { ccpaApplies: false, optedOut: false };
  return { ccpaApplies: true, optedOut: usp[2] === "Y" };
}

export function parseCoppa(regs: { coppa?: number }): boolean {
  return regs?.coppa === 1;
}

export function shouldSuppressPersonalization(
  consent: ConsentInfo,
  usp: { optedOut: boolean },
  coppa: boolean
): boolean {
  if (coppa) return true;
  if (usp.optedOut) return true;
  if (consent.gdprApplies && !consent.hasConsent) return true;
  return false;
}

/** Strip user-identifiable fields from OpenRTB log row (not necessarily from bid). */
export function shouldRedactUserFieldsInAuctionLog(
  consent: ConsentInfo,
  coppa: boolean
): { redact: boolean; privacySuppressed: boolean } {
  if (coppa) return { redact: true, privacySuppressed: true };
  if (consent.gdprApplies && !consent.hasConsent) return { redact: true, privacySuppressed: true };
  return { redact: false, privacySuppressed: false };
}
