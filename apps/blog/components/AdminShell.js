"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "./admin/AdminSidebar";

/**
 * Admin chrome: sidebar + main. Login page has no sidebar.
 */
export default function AdminShell({ children }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "stretch",
        minHeight: "70vh",
        gap: 0,
        background: "#0f1115",
        borderRadius: "0.75rem",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <AdminSidebar />
      <div
        style={{
          flex: "1 1 320px",
          padding: "1.25rem 1.5rem",
          minWidth: 0,
          background: "#0f1115",
        }}
      >
        {children}
      </div>
    </div>
  );
}
