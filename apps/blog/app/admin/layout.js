import Link from "next/link";
import AdminNav from "../../components/AdminNav";

export const metadata = {
  title: "Admin | BlogAI CMS",
  description: "AdsGupta BlogAI content and monetization management",
};

export default function AdminLayout({ children }) {
  return (
    <div className="shell" style={{ paddingTop: "1.5rem", paddingBottom: "3rem" }}>
      <AdminNav />
      {children}
    </div>
  );
}
