export type PublisherSellerRow = { id: string; name: string; domain: string };

export function buildSellersJsonBody(rows: PublisherSellerRow[]) {
  const sellers = rows.map((p) => ({
    seller_id: p.id,
    name: p.name,
    domain: p.domain,
    seller_type: "PUBLISHER" as const,
    is_confidential: 0 as const
  }));

  return {
    contact_email: "ranjan@adsgupta.com",
    contact_address: "exchange.adsgupta.com",
    version: "1.0",
    identifiers: [{ name: "TAG-ID", value: "mde-exchange-001" }],
    sellers
  };
}
