"use client";

import { useEffect, useState } from "react";

type TickerItem = { id: string; price: string; t: number };

export function LiveAuctionTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    let es: EventSource | null = null;
    let dead = false;
    let retry = 1;

    function connect() {
      if (dead) return;
      try {
        es = new EventSource("/api/auction-stream", { withCredentials: true });
      } catch {
        setOk(false);
        window.setTimeout(connect, Math.min(30000, retry * 1000));
        retry += 1;
        return;
      }
      es.onopen = () => {
        setOk(true);
        retry = 1;
      };
      es.onerror = () => {
        setOk(false);
        es?.close();
        window.setTimeout(connect, Math.min(30000, retry * 1000));
        retry += 1;
      };
      es.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data) as { type?: string; row?: Record<string, unknown> };
          if (msg.type !== "auction" || !msg.row) return;
          const id = String(msg.row.id ?? msg.row.auction_id ?? "").slice(0, 8);
          const wb = msg.row.winning_bid;
          const price =
            wb != null && Number.isFinite(Number(wb)) ? `$${Number(wb).toFixed(2)}` : "—";
          if (!id) return;
          setItems((prev) => {
            const next = [{ id, price, t: Date.now() }, ...prev.filter((x) => x.id !== id)].slice(0, 24);
            return next;
          });
        } catch {
          /* ignore */
        }
      };
    }

    connect();
    return () => {
      dead = true;
      es?.close();
    };
  }, []);

  const text =
    items.length === 0
      ? "Waiting for live auctions…"
      : items.map((i) => `${i.id} ${i.price}`).join("   ·   ");

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0, maxWidth: "50vw" }}>
      <span
        title={ok ? "SSE connected" : "Reconnecting…"}
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          flexShrink: 0,
          background: ok ? "#2ecc71" : "#ff4757",
          boxShadow: ok ? "0 0 8px #2ecc71" : "none"
        }}
      />
      <div
        style={{
          overflow: "hidden",
          whiteSpace: "nowrap",
          fontSize: 10,
          color: "#5a6d82",
          maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)"
        }}
      >
        <div className="mde-live-ticker-marquee">{text}</div>
      </div>
      <style>{`
        .mde-live-ticker-marquee {
          display: inline-block;
          padding-left: 100%;
          animation: mde-marquee 28s linear infinite;
        }
        @keyframes mde-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
