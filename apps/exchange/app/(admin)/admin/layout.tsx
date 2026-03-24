import { AdminExchangeShell } from "@/components/admin-exchange-shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminExchangeShell>{children}</AdminExchangeShell>;
}
