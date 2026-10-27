import "server-only";

import { getAdminSession } from "./session";
import { internalFetch } from "@/lib/internal-fetch";
import type {
  ArticleDetail,
  ArticleSection,
  Category,
  EquipmentDetail,
  Model3DDetail,
  Model3DSummary,
  Paginated,
} from "@/lib/api/public";

const API_BASE = process.env.DJANGO_API_BASE_URL || "http://127.0.0.1:8000";

async function adminGet<T>(path: string): Promise<T> {
  const session = await getAdminSession();
  const res = await internalFetch(`${API_BASE}${path}`, {
    headers: session ? { Authorization: `Bearer ${session.accessToken}` } : {},
  });
  if (!res.ok) throw new Error(`Admin API ${path} failed: ${res.status}`);
  return res.json();
}

export function adminGetArticles(section?: ArticleSection) {
  const qs = section ? `?section=${section}` : "";
  return adminGet<Paginated<ArticleDetail>>(`/api/v1/articles/${qs}`);
}

export function adminGetArticle(slug: string) {
  return adminGet<ArticleDetail>(`/api/v1/articles/${slug}/`);
}

export function adminGetEquipmentList() {
  return adminGet<Paginated<EquipmentDetail>>(`/api/v1/catalog/equipment/`);
}

export function adminGetEquipment(slug: string) {
  return adminGet<EquipmentDetail>(`/api/v1/catalog/equipment/${slug}/`);
}

export function adminGetCategories() {
  return adminGet<Paginated<Category>>(`/api/v1/catalog/categories/`);
}

export function adminGetModels3D() {
  return adminGet<Paginated<Model3DSummary>>(`/api/v1/catalog/models3d/`);
}

export function adminGetModel3D(slug: string) {
  return adminGet<Model3DDetail>(`/api/v1/catalog/models3d/${slug}/`);
}
