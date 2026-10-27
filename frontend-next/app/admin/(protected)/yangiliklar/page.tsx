import Link from "next/link";
import { adminGetArticles } from "@/lib/admin/data";
import { deleteArticle } from "@/lib/admin/actions";
import DeleteButton from "@/components/admin/DeleteButton";
import styles from "@/components/admin/admin.module.css";

export default async function AdminNewsListPage() {
  const news = await adminGetArticles("news");

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Yangiliklar</h1>
        <Link href="/admin/yangiliklar/new" className={styles.linkButton}>
          + Yangi qo&apos;shish
        </Link>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Sarlavha</th>
            <th>Holati</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {news.results.map((item) => (
            <tr key={item.slug}>
              <td>{item.title_uz}</td>
              <td>
                <span className={`${styles.statusBadge} ${item.is_published ? styles.statusBadgePublished : ""}`}>
                  {item.is_published ? "Chop etilgan" : "Qoralama"}
                </span>
              </td>
              <td>
                <div className={styles.rowActions}>
                  <Link href={`/admin/yangiliklar/${item.slug}`}>Tahrirlash</Link>
                  <DeleteButton action={deleteArticle.bind(null, "news", item.slug)}>O&apos;chirish</DeleteButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
