import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll: () => store.getAll() },
  });
}

export async function requireStaff() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user || user.user_metadata.role !== "staff") return null;
  return user;
}
