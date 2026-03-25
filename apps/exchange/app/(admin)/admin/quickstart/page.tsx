import { AdminQuickstart } from "@/components/admin-quickstart";

export default function AdminQuickstartPage() {
  const secret = process.env.DB_INIT_SECRET ?? "";
  return <AdminQuickstart secret={secret} />;
}

