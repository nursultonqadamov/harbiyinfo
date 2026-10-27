import Link from "next/link";
import { adminGetEquipmentList, adminGetCategories } from "@/lib/admin/data";
import { deleteEquipment, saveCategory } from "@/lib/admin/actions";
import DeleteButton from "@/components/admin/DeleteButton";
import styles from "@/components/admin/admin.module.css";

export default async function AdminEquipmentListPage() {
  const [equipment, categories] = await Promise.all([adminGetEquipmentList(), adminGetCategories()]);

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Texnika va qurollar</h1>
        <Link href="/admin/texnika/new" className={styles.linkButton}>
          + Yangi qo&apos;shish
        </Link>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nomi</th>
            <th>Toifa</th>
            <th>3D model</th>
            <th>Holati</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {equipment.results.map((item) => (
            <tr key={item.slug}>
              <td>{item.title_uz}</td>
              <td>{item.category?.name_uz ?? "-"}</td>
              <td>{item.viewer_slug || "-"}</td>
              <td>
                <span className={`${styles.statusBadge} ${item.is_published ? styles.statusBadgePublished : ""}`}>
                  {item.is_published ? "Chop etilgan" : "Qoralama"}
                </span>
              </td>
              <td>
                <div className={styles.rowActions}>
                  <Link href={`/admin/texnika/${item.slug}`}>Tahrirlash</Link>
                  <DeleteButton action={deleteEquipment.bind(null, item.slug)}>O&apos;chirish</DeleteButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Toifalar</h2>
        <ul style={{ marginBottom: 16, color: "var(--color-text-muted)", fontSize: 14 }}>
          {categories.results.map((c) => (
            <li key={c.id}>{c.name_uz}</li>
          ))}
        </ul>
        <form action={saveCategory} className={styles.form}>
          <div className={styles.formRow}>
            <label htmlFor="cat-name">Nomi</label>
            <input id="cat-name" name="name_uz" type="text" required />
          </div>
          <div className={styles.formRow}>
            <label htmlFor="cat-slug">Slug</label>
            <input id="cat-slug" name="slug" type="text" required />
          </div>
          <button type="submit" className={styles.submitButton}>
            Toifa qo&apos;shish
          </button>
        </form>
      </div>
    </div>
  );
}
