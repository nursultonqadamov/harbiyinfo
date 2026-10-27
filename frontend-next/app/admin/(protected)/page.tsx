import Link from "next/link";
import { adminGetArticles, adminGetEquipmentList } from "@/lib/admin/data";
import styles from "@/components/admin/admin.module.css";

export default async function AdminDashboardPage() {
  const [news, history, manuals, equipment] = await Promise.all([
    adminGetArticles("news"),
    adminGetArticles("history"),
    adminGetArticles("manual"),
    adminGetEquipmentList(),
  ]);

  const cards = [
    { label: "Yangiliklar", count: news.count, href: "/admin/yangiliklar" },
    { label: "Tarix maqolalari", count: history.count, href: "/admin/tarix" },
    { label: "Qo'llanmalar", count: manuals.count, href: "/admin/tarix" },
    { label: "Texnika va qurollar", count: equipment.count, href: "/admin/texnika" },
  ];

  return (
    <div>
      <h1 className={styles.pageTitle} style={{ marginBottom: 24 }}>
        Boshqaruv paneli
      </h1>
      <div className={styles.statCards}>
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className={styles.statCard} style={{ display: "block" }}>
            <div className={styles.statNumber}>{card.count}</div>
            <div className={styles.statLabel}>{card.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
