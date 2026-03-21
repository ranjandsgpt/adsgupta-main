/**
 * Supabase Auth helpers for Route Handlers and server code.
 */
import { createServerSupabase } from "./supabase-server.js";

/**
 * @returns {Promise<{ id: string, email: string } | null>}
 */
export async function getUser() {
  try {
    const supabase = createServerSupabase();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user?.email) return null;
    return { id: user.id, email: user.email };
  } catch {
    return null;
  }
}
