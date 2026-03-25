import { AdminExchangeShell } from "@/components/admin-exchange-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: true }
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminExchangeShell>{children}</AdminExchangeShell>;
}
