"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/admin/actions";
import type { Model3DDetail } from "@/lib/api/public";
import styles from "./admin.module.css";

export default function Model3DForm({
  action,
  initial,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  initial?: Model3DDetail;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className={styles.form} encType="multipart/form-data">
      <div className={styles.formRow}>
        <label htmlFor="slug">Slug (URL, masalan: t-90)</label>
        <input id="slug" name="slug" type="text" defaultValue={initial?.slug} required />
      </div>

      <div className={styles.formRow}>
        <label htmlFor="title">Nomi</label>
        <input id="title" name="title" type="text" defaultValue={initial?.title} required />
      </div>

      <div className={styles.formRow}>
        <label htmlFor="file">3D model fayli (.glb){initial ? " -- ixtiyoriy, faqat almashtirish uchun" : ""}</label>
        <input id="file" name="file" type="file" accept=".glb,model/gltf-binary" required={!initial} />
      </div>

      <div className={styles.formRow}>
        <label htmlFor="credit_text">Muallif/manba (masalan: Sketchfab, CC BY)</label>
        <input id="credit_text" name="credit_text" type="text" defaultValue={initial?.credit_text} />
      </div>

      <div className={styles.formRow}>
        <label htmlFor="glass_mesh_names">Shisha qismlar (vergul bilan, ixtiyoriy)</label>
        <input
          id="glass_mesh_names"
          name="glass_mesh_names"
          type="text"
          placeholder="glass_03,windshield_03"
          defaultValue={initial?.glass_mesh_names}
        />
      </div>

      <div className={styles.formRow}>
        <label htmlFor="closing_panels">Ilg'ak panellar (ilg'or, JSON, ixtiyoriy)</label>
        <textarea
          id="closing_panels"
          name="closing_panels"
          placeholder='[{"names":["nose"],"closedDegX":-90}]'
          defaultValue={initial ? JSON.stringify(initial.closing_panels) : "[]"}
          style={{ minHeight: 70, fontFamily: "monospace", fontSize: 13 }}
        />
      </div>

      {state?.error && <p className={styles.errorText}>{state.error}</p>}
      <button type="submit" disabled={pending} className={styles.submitButton}>
        {pending ? "Saqlanmoqda..." : "Saqlash"}
      </button>
    </form>
  );
}
