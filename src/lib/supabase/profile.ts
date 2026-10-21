import type { User } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase/service";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  image: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Reads the profile row with the service role and, when it is missing,
 * recreates it from the auth metadata — mirroring the `handle_new_user`
 * trigger. Without this, an account whose trigger never fired has no row in
 * `public.users`, so every admin check fails and the account is locked out.
 *
 * The role of an existing row is never overwritten.
 */
export async function fetchOrCreateProfile(
  authUser: User
): Promise<UserProfile | null> {
  const service = createServiceClient();
  if (!service) return null;

  const { data: existing } = await service
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .maybeSingle();

  if (existing) return existing as UserProfile;

  const metadata = (authUser.user_metadata ?? {}) as Record<string, unknown>;
  const name = typeof metadata.name === "string" ? metadata.name : "";
  const phone = typeof metadata.phone === "string" ? metadata.phone : null;
  const role = metadata.role === "admin" ? "admin" : "student";

  const { data: created, error } = await service
    .from("users")
    .insert({
      id: authUser.id,
      email: authUser.email ?? "",
      name,
      role,
      phone,
    })
    .select()
    .single();

  if (error) return null;
  return created as UserProfile;
}
