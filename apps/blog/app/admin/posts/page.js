import { redirect } from "next/navigation";
import { getUser } from "../../../lib/auth.js";
import { createServerSupabase } from "../../../lib/supabase-server.js";
import { isSupabaseCmsEnabled } from "../../../lib/cms-runtime.js";
import * as cms from "../../../lib/supabase-cms.js";
import { getAllPostsForAdmin } from "../../../lib/db.js";
import PostManagerClient from "../../../components/admin/PostManagerClient";

export default async function AdminPostsPage({ searchParams }) {
  const user = await getUser();
  if (!user) redirect("/admin/login");

  const tab = searchParams?.tab || "all";
  const q = searchParams?.q || "";

  let posts = [];

  if (isSupabaseCmsEnabled()) {
    try {
      const supabase = createServerSupabase();
      posts = await cms.listPostsForAdmin(supabase, user.id, {
        status: tab === "all" ? undefined : tab,
        q,
      });
    } catch {
      posts = getAllPostsForAdmin();
    }
  } else {
    const filters = {};
    if (tab !== "all") filters.status = tab;
    posts = getAllPostsForAdmin(filters);
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      posts = posts.filter(
        (p) =>
          (p.title || "").toLowerCase().includes(t) || (p.slug || "").toLowerCase().includes(t)
      );
    }
  }

  return <PostManagerClient initialPosts={posts} tab={tab} q={q} />;
}
