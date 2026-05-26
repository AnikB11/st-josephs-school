"use client";

import { useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Browser Supabase client. Uses the auth cookie set by Supabase Auth,
 * so RLS automatically sees the signed-in user. Safe for both
 * authenticated and unauthenticated reads.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(URL, ANON);
}

/**
 * Memoised browser client for use inside client components.
 */
export function useSupabaseClient() {
  return useMemo(() => createBrowserClient(URL, ANON), []);
}
