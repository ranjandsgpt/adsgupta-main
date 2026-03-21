"use client";

import { usePathname } from "next/navigation";
import AdminNav from "./AdminNav";

/**
 * Hides admin chrome on /admin/login (Supabase auth page).
 */
export default function AdminShell({ children }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }
  return (
    <>
      <AdminNav />
      {children}
    </>
  );
}
