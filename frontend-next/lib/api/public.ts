// Server-side only fetch helpers for Django's public (AllowAny GET) endpoints.
// Called from Server Components -- the browser never talks to Django
// directly, so no CORS/JWT concerns here.
import { internalFetch } from "@/lib/internal-fetch";

const API_BASE = process.env.DJANGO_API_BASE_URL || "http://127.0.0.1:8000";

export type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] };

export type ArticleSection = "news" | "history" | "manual";

export type MediaAsset = {
  id: number;
  media_type: "image" | "video" | "youtube";
  file: string | null;
  youtube_url: string | null;
  caption: string;
  order: number;
  created_at: string;
};

export type ArticleSummary = {
  id: number;
  section: ArticleSection;
  title_uz: string;
  title_en: string;
  slug: string;
  excerpt_uz: string;
  excerpt_en: string;
  cover_image: string | null;
  is_published: boolean;
  published_at: string | null;
};

export type ArticleDetail = ArticleSummary & {
  body_uz: string;
  body_en: string;
  author: number | null;
  media: MediaAsset[];
  created_at: string;
  updated_at: string;
};

export type Category = { id: number; name_uz: string; name_en: string; slug: string };

export type EquipmentSpec = { id: number; label: string; value: string; order: number };

export type EquipmentSummary = {
  id: number;
  category: Category | null;
  title_uz: string;
  title_en: string;
  slug: string;
  short_description_uz: string;
  short_description_en: string;
  cover_image: string | null;
  viewer_slug: string;
  is_published: boolean;
  published_at: string | null;
};

export type EquipmentDetail = EquipmentSummary & {
  full_description_uz: string;
  full_description_en: string;
  specs: EquipmentSpec[];
  media: MediaAsset[];
  created_at: string;
  updated_at: string;
};

export type Model3DPart = {
  id: number;
  mesh_name: string;
  title_uz: string;
  title_en: string;
  description_uz: string;
  description_en: string;
};

export type Model3DSummary = { id: number; slug: string; title: string };

export type ClosingPanel = { names: string[]; closedDegX: number };

export type Model3DDetail = Model3DSummary & {
  file: string;
  credit_text: string;
  glass_mesh_names: string;
  glass_base_opacity: number;
  closing_panels: ClosingPanel[];
  parts: Model3DPart[];
  created_at: string;
  updated_at: string;
};

async function apiGet<T>(path: string): Promise<T> {
  const res = await internalFetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`Django API ${path} failed with ${res.status}`);
  }
  return res.json();
}

export function getArticles(section?: ArticleSection) {
  const qs = section ? `?section=${section}` : "";
  return apiGet<Paginated<ArticleSummary>>(`/api/v1/articles/${qs}`);
}

export function getArticle(slug: string) {
  return apiGet<ArticleDetail>(`/api/v1/articles/${slug}/`);
}

export function getEquipmentList() {
  return apiGet<Paginated<EquipmentSummary>>(`/api/v1/catalog/equipment/`);
}

export function getEquipment(slug: string) {
  return apiGet<EquipmentDetail>(`/api/v1/catalog/equipment/${slug}/`);
}

export function getCategories() {
  return apiGet<Paginated<Category>>(`/api/v1/catalog/categories/`);
}

export function getModel3D(slug: string) {
  return apiGet<Model3DDetail>(`/api/v1/catalog/models3d/${slug}/`);
}
