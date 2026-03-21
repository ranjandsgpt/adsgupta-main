import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options.js";

/**
 * @returns {Promise<{ id: string, email: string, name?: string, subdomain?: string } | null>}
 */
export async function getUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  return {
    id: session.user.email,
    email: session.user.email,
    name: session.user.name,
    subdomain: session.user.subdomain,
  };
}

/** Synthetic profile for admin UI (no profiles table). */
export function profileFromUser(user) {
  if (!user?.email) return null;
  return {
    full_name: user.name || user.email,
    username: String(user.email).split("@")[0],
    subdomain: user.subdomain || null,
  };
}
