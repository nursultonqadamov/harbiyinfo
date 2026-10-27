import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { internalFetch } from "@/lib/internal-fetch";

const API_BASE = process.env.DJANGO_API_BASE_URL || "http://127.0.0.1:8000";

export type AdminSession = { username: string; accessToken: string };

// cache() de-dupes repeated calls within a single render pass -- the
// DAL pattern from the Next.js auth guide.
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const store = await cookies();
  const access = store.get("admin_access")?.value;
  if (!access) return null;

  const res = await internalFetch(`${API_BASE}/api/v1/auth/me/`, {
    headers: { Authorization: `Bearer ${access}` },
  });
  if (!res.ok) return null;

  const data = await res.json();
  if (!data.is_staff) return null;
  return { username: data.username, accessToken: access };
});

export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
