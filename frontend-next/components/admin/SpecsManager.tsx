"use client";

import type { EquipmentSpec } from "@/lib/api/public";
import DeleteButton from "./DeleteButton";
import styles from "./admin.module.css";

type SpecItem = { spec: EquipmentSpec; deleteAction: () => void };

export default function SpecsManager({
  items,
  addAction,
}: {
  items: SpecItem[];
  addAction: (formData: FormData) => void;
}) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Texnik xususiyatlar</h2>

      {items.map(({ spec, deleteAction }) => (
        <div key={spec.id} className={styles.specRow}>
          <span>{spec.label}</span>
          <span style={{ flex: 1 }}>{spec.value}</span>
          <DeleteButton action={deleteAction} confirmText="Bu qatorni o'chirasizmi?" />
        </div>
      ))}

      <form action={addAction} className={styles.form} style={{ marginTop: 16 }}>
        <div className={styles.formRow}>
          <label htmlFor="spec-label">Nomi (masalan: Tezlik)</label>
          <input id="spec-label" name="label" type="text" required />
        </div>
        <div className={styles.formRow}>
          <label htmlFor="spec-value">Qiymati (masalan: 2500 km/soat)</label>
          <input id="spec-value" name="value" type="text" required />
        </div>
        <button type="submit" className={styles.submitButton}>
          Qo&apos;shish
        </button>
      </form>
    </div>
  );
}
