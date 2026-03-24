"use client";

import { useEffect } from "react";

export function AdminToast({
  message,
  onClear
}: {
  message: string | null;
  onClear: () => void;
}) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => onClear(), 4500);
    return () => clearTimeout(t);
  }, [message, onClear]);

  if (!message) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 200,
        padding: "12px 18px",
        borderRadius: 8,
        background: "#143d28",
        border: "1px solid #2ecc7155",
        color: "#2ecc71",
        fontSize: 13,
        fontWeight: 600,
        boxShadow: "0 8px 24px #0008"
      }}
      role="status"
    >
      {message}
    </div>
  );
}
