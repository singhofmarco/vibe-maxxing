import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Supabase client for Client Components (browser).
 * Uses cookies for session handling when used with Supabase Auth.
 */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
