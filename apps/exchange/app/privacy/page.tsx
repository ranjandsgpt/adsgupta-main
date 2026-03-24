import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy · MyExchange"
};

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px 48px", lineHeight: 1.65, fontSize: 14 }}>
      <p style={{ marginBottom: 24 }}>
        <Link href="/" style={{ color: "var(--accent, #00d4aa)" }}>
          ← Home
        </Link>
      </p>
      <h1 style={{ fontSize: 28, margin: "0 0 16px", color: "var(--text-bright, #e8f0f8)" }}>Privacy Policy</h1>
      <p style={{ color: "var(--text-muted, #5a6d82)", marginTop: 0 }}>
        Last updated: March 2025. MyExchange (“MDE”, “we”) operates the ad exchange at exchange.adsgupta.com.
      </p>

      <h2 style={{ fontSize: 18, marginTop: 28, color: "var(--text-bright, #e8f0f8)" }}>What we collect</h2>
      <ul style={{ color: "var(--text-muted, #5a6d82)", paddingLeft: 20 }}>
        <li>
          <strong style={{ color: "var(--text-bright, #e8f0f8)" }}>Technical signals</strong>: truncated or hashed IP (for
          fraud and coarse geo), user agent, referrer, and page URL where the ad tag runs.
        </li>
        <li>
          <strong style={{ color: "var(--text-bright, #e8f0f8)" }}>Auction & delivery data</strong>: bid responses,
          impressions, clicks, floors, and campaign identifiers needed for settlement and reporting.
        </li>
        <li>
          <strong style={{ color: "var(--text-bright, #e8f0f8)" }}>Account data</strong>: contact email and
          organization details you provide when registering as a publisher or advertiser.
        </li>
      </ul>

      <h2 style={{ fontSize: 18, marginTop: 28, color: "var(--text-bright, #e8f0f8)" }}>How we use data</h2>
      <p style={{ color: "var(--text-muted, #5a6d82)" }}>
        We process data to run real-time auctions, match demand to inventory, prevent invalid traffic, enforce policies,
        and meet financial and legal obligations. We do not sell personal data as defined under GDPR.
      </p>

      <h2 style={{ fontSize: 18, marginTop: 28, color: "var(--text-bright, #e8f0f8)" }}>Retention</h2>
      <p style={{ color: "var(--text-muted, #5a6d82)" }}>
        By default, auction logs, impressions, and clicks are retained for <strong>90 days</strong>, after which they may
        be deleted as part of automated cleanup. Aggregated metrics may be kept longer in non-identifiable form.
      </p>

      <h2 style={{ fontSize: 18, marginTop: 28, color: "var(--text-bright, #e8f0f8)" }}>GDPR rights</h2>
      <p style={{ color: "var(--text-muted, #5a6d82)" }}>
        Where GDPR applies, you may request access, rectification, restriction, portability, or erasure of personal
        data we hold about you, and object to certain processing. Contact us at{" "}
        <a href="mailto:privacy@adsgupta.com" style={{ color: "var(--accent, #00d4aa)" }}>
          privacy@adsgupta.com
        </a>
        . We will respond within applicable statutory timelines.
      </p>

      <h2 style={{ fontSize: 18, marginTop: 28, color: "var(--text-bright, #e8f0f8)" }}>Processor / DPA</h2>
      <p style={{ color: "var(--text-muted, #5a6d82)" }}>
        Publishers and buyers acting as controllers may require a Data Processing Agreement (DPA) for EU/UK processing.
        Request a copy at{" "}
        <a href="mailto:privacy@adsgupta.com" style={{ color: "var(--accent, #00d4aa)" }}>
          privacy@adsgupta.com
        </a>
        .
      </p>

      <h2 style={{ fontSize: 18, marginTop: 28, color: "var(--text-bright, #e8f0f8)" }}>India — DPDPA</h2>
      <p style={{ color: "var(--text-muted, #5a6d82)" }}>
        For users in the Republic of India, we commit to the Digital Personal Data Protection Act (DPDPA), 2023. Data may
        be processed through international service providers using standard safeguards where cross-border transfer applies.
        You may exercise rights of access, correction, erasure, and grievance redressal.
      </p>
      <p style={{ color: "var(--text-muted, #5a6d82)" }}>
        <strong style={{ color: "var(--text-bright, #e8f0f8)" }}>Grievance officer (India):</strong>{" "}
        <a href="mailto:grievance-in@adsgupta.com" style={{ color: "var(--accent, #00d4aa)" }}>
          grievance-in@adsgupta.com
        </a>
        . We aim to acknowledge complaints promptly and resolve them within timelines compatible with Indian law.
      </p>

      <h2 style={{ fontSize: 18, marginTop: 28, color: "var(--text-bright, #e8f0f8)" }}>TCF / consent strings</h2>
      <p style={{ color: "var(--text-muted, #5a6d82)" }}>
        Where IAB TCF 2.2 signals are present on bid requests, we honor GDPR applicability and consent strings to limit
        personalization and logging of user-level identifiers as described in our integration documentation.
      </p>

      <h2 style={{ fontSize: 18, marginTop: 28, color: "var(--text-bright, #e8f0f8)" }}>Contact</h2>
      <p style={{ color: "var(--text-muted, #5a6d82)" }}>
        Privacy questions:{" "}
        <a href="mailto:privacy@adsgupta.com" style={{ color: "var(--accent, #00d4aa)" }}>
          privacy@adsgupta.com
        </a>
      </p>
    </div>
  );
}
