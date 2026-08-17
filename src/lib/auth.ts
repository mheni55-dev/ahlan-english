import { createClient } from "@/lib/supabase/server";

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}

export async function requireAuth() {
  const user = await getUser();
  if (!user) return null;
  return user;
}

export async function requireAdmin() {
  const profile = await getUserProfile();
  if (!profile || profile.role !== "admin") return null;
  return profile;
}
