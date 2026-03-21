import { redirect } from "next/navigation";
import { getUser } from "../../../lib/auth.js";
import { isPostgresConfigured } from "../../../lib/cms-runtime.js";
import * as cms from "../../../lib/cms-pg.js";
import PostManagerClient from "../../../components/admin/PostManagerClient";

export default async function AdminPostsPage({ searchParams }) {
  const user = await getUser();
  if (!user) redirect("/admin/login");

  const tab = searchParams?.tab || "all";
  const q = searchParams?.q || "";

  let posts = [];

  if (isPostgresConfigured()) {
    try {
      posts = await cms.listPostsForAdmin(user.email, {
        status: tab === "all" ? undefined : tab,
        q,
      });
    } catch {
      posts = [];
    }
  }

  return <PostManagerClient initialPosts={posts} tab={tab} q={q} />;
}
