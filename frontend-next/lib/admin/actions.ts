"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { internalFetch } from "@/lib/internal-fetch";

const API_BASE = process.env.DJANGO_API_BASE_URL || "http://127.0.0.1:8000";
const ACCESS_COOKIE = "admin_access";
const REFRESH_COOKIE = "admin_refresh";

export type ActionState = { error?: string } | undefined;

export async function login(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const username = formData.get("username");
  const password = formData.get("password");

  const res = await internalFetch(`${API_BASE}/api/v1/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    return { error: "Login yoki parol noto'g'ri." };
  }
  const data = await res.json();
  const store = await cookies();
  const secure = process.env.NODE_ENV === "production";
  store.set(ACCESS_COOKIE, data.access, { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 60 * 60 * 12 });
  store.set(REFRESH_COOKIE, data.refresh, { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
  redirect("/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
  redirect("/admin/login");
}

async function djangoFetch(
  path: string,
  init: { method?: string; headers?: Record<string, string>; body?: FormData | string } = {}
) {
  const store = await cookies();
  const access = store.get(ACCESS_COOKIE)?.value;
  const headers = { ...(init.headers || {}) };
  if (access) headers.Authorization = `Bearer ${access}`;
  return internalFetch(`${API_BASE}${path}`, { ...init, headers });
}

async function errorFromResponse(res: { text: () => Promise<string>; status: number }) {
  const body = await res.text();
  return `Saqlashda xatolik (${res.status}): ${body.slice(0, 300)}`;
}

// An <input type="file"> with nothing chosen still appends an empty File
// (name="", size=0) to FormData -- Django's FileField rejects that as "the
// submitted file is empty" instead of treating it as "field not sent".
function dropEmptyFile(formData: FormData, key: string) {
  // Server-side, an unfilled <input type="file"> arrives as a zero-byte
  // File -- Node's File gives it a generic name ("blob") rather than the
  // browser's own empty string, so size is the only reliable "no file
  // chosen" signal here.
  const value = formData.get(key) as { size?: number } | string | null;
  if (value && typeof value === "object" && value.size === 0) {
    formData.delete(key);
  }
}

// ---------------------------------------------------------------------
// Articles (news / history / manual -- one shared shape, see catalog.md)
// ---------------------------------------------------------------------

export async function saveArticle(slug: string | null, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  if (!formData.has("is_published")) formData.set("is_published", "false");
  dropEmptyFile(formData, "cover_image");
  const section = formData.get("section");

  const path = slug ? `/api/v1/articles/${slug}/` : `/api/v1/articles/`;
  const res = await djangoFetch(path, { method: slug ? "PATCH" : "POST", body: formData });
  if (!res.ok) return { error: await errorFromResponse(res) };

  revalidatePath("/admin");
  const listPath = section === "news" ? "/admin/yangiliklar" : "/admin/tarix";
  revalidatePath(listPath);
  revalidatePath(section === "news" ? "/yangiliklar" : "/tarix");
  redirect(listPath);
}

export async function deleteArticle(section: "news" | "history" | "manual", slug: string) {
  await djangoFetch(`/api/v1/articles/${slug}/`, { method: "DELETE" });
  revalidatePath(section === "news" ? "/admin/yangiliklar" : "/admin/tarix");
}

export async function uploadArticleMedia(slug: string, redirectPath: string, formData: FormData) {
  await djangoFetch(`/api/v1/articles/${slug}/media/`, { method: "POST", body: formData });
  revalidatePath(redirectPath);
}

export async function deleteArticleMedia(slug: string, mediaId: number, redirectPath: string) {
  await djangoFetch(`/api/v1/articles/${slug}/media/${mediaId}/`, { method: "DELETE" });
  revalidatePath(redirectPath);
}

// ---------------------------------------------------------------------
// Equipment catalog
// ---------------------------------------------------------------------

export async function saveEquipment(slug: string | null, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  if (formData.get("category_id") === "") formData.delete("category_id");
  if (!formData.has("is_published")) formData.set("is_published", "false");
  dropEmptyFile(formData, "cover_image");

  const path = slug ? `/api/v1/catalog/equipment/${slug}/` : `/api/v1/catalog/equipment/`;
  const res = await djangoFetch(path, { method: slug ? "PATCH" : "POST", body: formData });
  if (!res.ok) return { error: await errorFromResponse(res) };

  revalidatePath("/admin/texnika");
  revalidatePath("/texnika");
  redirect("/admin/texnika");
}

export async function deleteEquipment(slug: string) {
  await djangoFetch(`/api/v1/catalog/equipment/${slug}/`, { method: "DELETE" });
  revalidatePath("/admin/texnika");
}

export async function addEquipmentSpec(slug: string, formData: FormData) {
  await djangoFetch(`/api/v1/catalog/equipment/${slug}/specs/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      label: formData.get("label"),
      value: formData.get("value"),
      order: Number(formData.get("order") || 0),
    }),
  });
  revalidatePath(`/admin/texnika/${slug}`);
}

export async function deleteEquipmentSpec(slug: string, specId: number) {
  await djangoFetch(`/api/v1/catalog/equipment/${slug}/specs/${specId}/`, { method: "DELETE" });
  revalidatePath(`/admin/texnika/${slug}`);
}

export async function uploadEquipmentMedia(slug: string, formData: FormData) {
  await djangoFetch(`/api/v1/catalog/equipment/${slug}/media/`, { method: "POST", body: formData });
  revalidatePath(`/admin/texnika/${slug}`);
}

export async function deleteEquipmentMedia(slug: string, mediaId: number) {
  await djangoFetch(`/api/v1/catalog/equipment/${slug}/media/${mediaId}/`, { method: "DELETE" });
  revalidatePath(`/admin/texnika/${slug}`);
}

export async function saveCategory(formData: FormData) {
  await djangoFetch(`/api/v1/catalog/categories/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name_uz: formData.get("name_uz"),
      name_en: formData.get("name_en") || "",
      slug: formData.get("slug"),
    }),
  });
  revalidatePath("/admin/texnika");
}

// ---------------------------------------------------------------------
// 3D models
// ---------------------------------------------------------------------

export async function saveModel3D(slug: string | null, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  dropEmptyFile(formData, "file");
  const targetSlug = (formData.get("slug") as string) || slug;

  const path = slug ? `/api/v1/catalog/models3d/${slug}/` : `/api/v1/catalog/models3d/`;
  const res = await djangoFetch(path, { method: slug ? "PATCH" : "POST", body: formData });
  if (!res.ok) return { error: await errorFromResponse(res) };

  revalidatePath("/admin/modellar");
  redirect(`/admin/modellar/${targetSlug}`);
}

export async function deleteModel3D(slug: string) {
  await djangoFetch(`/api/v1/catalog/models3d/${slug}/`, { method: "DELETE" });
  revalidatePath("/admin/modellar");
}

export type PartLabelInput = {
  mesh_name: string;
  title_uz: string;
  description_uz: string;
};

export async function saveModel3DParts(slug: string, parts: PartLabelInput[]) {
  const res = await djangoFetch(`/api/v1/catalog/models3d/${slug}/parts/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ parts }),
  });
  if (!res.ok) throw new Error(await errorFromResponse(res));
  revalidatePath(`/admin/modellar/${slug}`);
}
