import { createClient } from "@/lib/supabase/server";
import { fetchOrCreateProfile, type UserProfile } from "@/lib/supabase/profile";

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (data) return data as UserProfile;

  // The profile row is missing (the `handle_new_user` trigger never ran for
  // this account). Recreate it instead of locking the account out.
  return fetchOrCreateProfile(user);
}

export async function requireAuth() {
  const user = await getUser();
  if (!user) return null;
  return user;
}

export async function requireAdmin(): Promise<UserProfile | null> {
  const profile = await getUserProfile();
  if (!profile || profile.role !== "admin") return null;
  return profile;
}
