import { createBrowserClient } from "@supabase/ssr";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return { url, anonKey };
}

export function createClient() {
  const { url, anonKey } = getSupabaseConfig();

  if (!url || !anonKey || url.includes("your-project") || anonKey.includes("your-anon-key")) {
    throw new Error("Supabase is not configured correctly.");
  }

  return createBrowserClient(url, anonKey);
}

export const createBrowserClientAlias = createClient;
export { createBrowserClientAlias as createBrowserClient };
