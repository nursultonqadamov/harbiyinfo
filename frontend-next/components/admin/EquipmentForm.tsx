"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/admin/actions";
import type { Category, EquipmentDetail } from "@/lib/api/public";
import styles from "./admin.module.css";

export default function EquipmentForm({
  action,
  initial,
  categories,
  viewerModels,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  initial?: EquipmentDetail;
  categories: Category[];
  /** Models already uploaded via /admin/modellar -- picked here, not
   * uploaded from this form. */
  viewerModels: { slug: string; title: string }[];
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className={styles.form} encType="multipart/form-data">
      <div className={styles.formRow}>
        <label htmlFor="category_id">Toifa</label>
        <select id="category_id" name="category_id" defaultValue={initial?.category?.id ?? ""}>
          <option value="">-- Toifasiz --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name_uz}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formRow}>
        <label htmlFor="slug">Slug (URL)</label>
        <input id="slug" name="slug" type="text" defaultValue={initial?.slug} required />
      </div>

      <div className={styles.formRow}>
        <label htmlFor="title_uz">Nomi (o&apos;zbekcha)</label>
        <input id="title_uz" name="title_uz" type="text" defaultValue={initial?.title_uz} required />
      </div>
      <div className={styles.formRow}>
        <label htmlFor="title_en">Nomi (inglizcha, ixtiyoriy)</label>
        <input id="title_en" name="title_en" type="text" defaultValue={initial?.title_en} />
      </div>

      <div className={styles.formRow}>
        <label htmlFor="short_description_uz">Qisqacha tavsif (o&apos;zbekcha)</label>
        <textarea
          id="short_description_uz"
          name="short_description_uz"
          defaultValue={initial?.short_description_uz}
          style={{ minHeight: 70 }}
        />
      </div>

      <div className={styles.formRow}>
        <label htmlFor="cover_image">Muqova rasmi{initial ? " -- ixtiyoriy, faqat almashtirish uchun" : ""}</label>
        <input id="cover_image" name="cover_image" type="file" accept="image/*" />
      </div>

      <div className={styles.formRow}>
        <label htmlFor="full_description_uz">To&apos;liq tavsif (o&apos;zbekcha)</label>
        <textarea id="full_description_uz" name="full_description_uz" defaultValue={initial?.full_description_uz} />
      </div>
      <div className={styles.formRow}>
        <label htmlFor="full_description_en">To&apos;liq tavsif (inglizcha, ixtiyoriy)</label>
        <textarea id="full_description_en" name="full_description_en" defaultValue={initial?.full_description_en} />
      </div>

      <div className={styles.formRow}>
        <label htmlFor="viewer_slug">3D model</label>
        <select id="viewer_slug" name="viewer_slug" defaultValue={initial?.viewer_slug ?? ""}>
          <option value="">-- 3D model yo&apos;q --</option>
          {viewerModels.map((m) => (
            <option key={m.slug} value={m.slug}>
              {m.title}
            </option>
          ))}
        </select>
      </div>

      <div className={`${styles.formRow} ${styles.checkboxRow}`}>
        <input id="is_published" name="is_published" type="checkbox" value="true" defaultChecked={initial?.is_published} />
        <label htmlFor="is_published">Chop etilsin (saytda ko&apos;rinadi)</label>
      </div>

      {state?.error && <p className={styles.errorText}>{state.error}</p>}
      <button type="submit" disabled={pending} className={styles.submitButton}>
        {pending ? "Saqlanmoqda..." : "Saqlash"}
      </button>
    </form>
  );
}
