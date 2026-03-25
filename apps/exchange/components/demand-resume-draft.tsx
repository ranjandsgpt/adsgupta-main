"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_CAMPAIGN = "demand_campaign_id";
const STORAGE_EMAIL = "demand_advertiser_email";

export function DemandResumeDraft() {
  const [draft, setDraft] = useState<{ id: string; email: string } | null>(null);

  useEffect(() => {
    const id = sessionStorage.getItem(STORAGE_CAMPAIGN);
    const email = sessionStorage.getItem(STORAGE_EMAIL);
    if (id && email) setDraft({ id, email });
  }, []);

  if (!draft) return null;

  return (
    <div
      className="portal-card"
      style={{
        marginBottom: 24,
        padding: 18,
        borderColor: "#ffd32a55",
        background: "linear-gradient(145deg, rgba(255,211,42,0.08), transparent)"
      }}
    >
      <div style={{ fontWeight: 800, color: "#ffd32a", marginBottom: 6, fontSize: 14 }}>Resume draft</div>
      <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
        You have an in-progress campaign. Continue upload and review.
      </p>
      <Link
        href={`/demand/create?campaign_id=${encodeURIComponent(draft.id)}&email=${encodeURIComponent(draft.email)}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "10px 16px",
          borderRadius: 8,
          background: "#ffd32a",
          color: "#0c1018",
          fontWeight: 800,
          fontSize: 13,
          textDecoration: "none"
        }}
      >
        Continue campaign →
      </Link>
    </div>
  );
}
