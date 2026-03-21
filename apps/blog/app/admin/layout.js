import AdminShell from "../../components/AdminShell";
import AdminProviders from "./providers";

export const metadata = {
  title: "Admin | BlogAI CMS",
  description: "AdsGupta BlogAI content and monetization management",
};

export default function AdminLayout({ children }) {
  return (
    <AdminProviders>
      <div className="shell" style={{ paddingTop: "1.5rem", paddingBottom: "3rem" }}>
        <AdminShell>{children}</AdminShell>
      </div>
    </AdminProviders>
  );
}
