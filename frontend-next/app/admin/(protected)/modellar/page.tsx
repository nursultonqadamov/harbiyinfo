import Link from "next/link";
import { adminGetModels3D } from "@/lib/admin/data";
import { deleteModel3D } from "@/lib/admin/actions";
import DeleteButton from "@/components/admin/DeleteButton";
import styles from "@/components/admin/admin.module.css";

export default async function AdminModels3DListPage() {
  const models = await adminGetModels3D();

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>3D modellar</h1>
        <Link href="/admin/modellar/new" className={styles.linkButton}>
          + Yangi model yuklash
        </Link>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nomi</th>
            <th>Slug</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {models.results.map((m) => (
            <tr key={m.slug}>
              <td>{m.title}</td>
              <td>{m.slug}</td>
              <td>
                <div className={styles.rowActions}>
                  <Link href={`/admin/modellar/${m.slug}`}>Tahrirlash / qismlarni belgilash</Link>
                  <DeleteButton action={deleteModel3D.bind(null, m.slug)}>O&apos;chirish</DeleteButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
