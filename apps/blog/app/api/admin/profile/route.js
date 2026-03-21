import { NextResponse } from "next/server";
import { getUser, profileFromUser } from "../../../../lib/auth.js";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const profile = profileFromUser(user);
  return NextResponse.json({
    subdomain: profile?.subdomain ?? null,
    linkedin_token: null,
    instagram_token: null,
    facebook_token: null,
    twitter_token: null,
    full_name: profile?.full_name ?? null,
    username: profile?.username ?? null,
  });
}
