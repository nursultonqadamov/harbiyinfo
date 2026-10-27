"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/admin/actions";
import type { ArticleDetail } from "@/lib/api/public";
import styles from "./admin.module.css";

// Tarix bo'limi ikkita section qiymatini birlashtiradi (Yangiliklar formasi
// har doim fixedSection="news" bilan chaqiriladi, shu tanlov kerak bo'lmaydi).
const TARIX_SECTION_OPTIONS = [
  { value: "history", label: "Urushlar tarixi" },
  { value: "manual", label: "Qo'llanma" },
];

export default function ArticleForm({
  action,
  initial,
  fixedSection,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  initial?: ArticleDetail;
  /** When set, the section is locked to this value (e.g. the Yangiliklar
   * form always creates "news"); otherwise the admin picks history/manual
   * from a dropdown (used by the Tarix form). */
  fixedSection?: "news" | "history" | "manual";
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className={styles.form} encType="multipart/form-data">
      {fixedSection ? (
        <input type="hidden" name="section" value={fixedSection} />
      ) : (
        <div className={styles.formRow}>
          <label htmlFor="section">Bo&apos;lim</label>
          <select id="section" name="section" defaultValue={initial?.section ?? TARIX_SECTION_OPTIONS[0].value}>
            {TARIX_SECTION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.formRow}>
        <label htmlFor="slug">Slug (URL, faqat lotin harflar/raqamlar/chiziqcha)</label>
        <input id="slug" name="slug" type="text" defaultValue={initial?.slug} required />
      </div>

      <div className={styles.formRow}>
        <label htmlFor="title_uz">Sarlavha (o&apos;zbekcha)</label>
        <input id="title_uz" name="title_uz" type="text" defaultValue={initial?.title_uz} required />
      </div>
      <div className={styles.formRow}>
        <label htmlFor="title_en">Sarlavha (inglizcha, ixtiyoriy)</label>
        <input id="title_en" name="title_en" type="text" defaultValue={initial?.title_en} />
      </div>

      <div className={styles.formRow}>
        <label htmlFor="excerpt_uz">Qisqacha mazmun (o&apos;zbekcha)</label>
        <textarea id="excerpt_uz" name="excerpt_uz" defaultValue={initial?.excerpt_uz} style={{ minHeight: 70 }} />
      </div>

      <div className={styles.formRow}>
        <label htmlFor="body_uz">Matn (o&apos;zbekcha)</label>
        <textarea id="body_uz" name="body_uz" defaultValue={initial?.body_uz} required />
      </div>
      <div className={styles.formRow}>
        <label htmlFor="body_en">Matn (inglizcha, ixtiyoriy)</label>
        <textarea id="body_en" name="body_en" defaultValue={initial?.body_en} />
      </div>

      <div className={styles.formRow}>
        <label htmlFor="cover_image">Muqova rasmi</label>
        <input id="cover_image" name="cover_image" type="file" accept="image/*" />
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
