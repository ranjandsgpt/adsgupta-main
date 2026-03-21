import { redirect } from "next/navigation";

export default function AdminNewPage() {
  redirect("/admin/posts/new");
}
