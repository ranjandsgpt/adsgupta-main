import { isSupabaseCmsEnabled } from "./cms-runtime.js";

/** First active inline ad: Supabase ad_slots, else legacy SQLite monetization row. */
export async function getInlineMonetizationScript() {
  if (isSupabaseCmsEnabled()) {
    try {
      const { createServerSupabase } = await import("./supabase-server.js");
      const supabase = createServerSupabase();
      const { data } = await supabase
        .from("ad_slots")
        .select("ad_code")
        .eq("active", true)
        .eq("placement", "inline")
        .limit(1);
      if (data?.[0]?.ad_code) return String(data[0].ad_code);
    } catch {
      /* fall through */
    }
  }
  try {
    const { getMonetizationScripts } = await import("./db.js");
    const scripts = getMonetizationScripts();
    return scripts?.[0]?.script || "";
  } catch {
    return "";
  }
}
