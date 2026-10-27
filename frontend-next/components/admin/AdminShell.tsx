import Link from "next/link";
import { logout } from "@/lib/admin/actions";
import styles from "./admin.module.css";

const NAV = [
  { href: "/admin", label: "Boshqaruv paneli" },
  { href: "/admin/yangiliklar", label: "Yangiliklar" },
  { href: "/admin/texnika", label: "Texnika va qurollar" },
  { href: "/admin/tarix", label: "Tarix va qo'llanmalar" },
  { href: "/admin/modellar", label: "3D modellar" },
];

export default function AdminShell({ username, children }: { username: string; children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>HarbiyInfo admin</div>
        <nav>
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink} style={{ display: "block" }}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.spacer} />
        <div style={{ padding: "0 20px 12px", fontSize: 12, color: "var(--color-text-muted)" }}>{username}</div>
        <form action={logout} className={styles.logoutForm}>
          <button type="submit" className={styles.logoutButton}>
            Chiqish
          </button>
        </form>
      </aside>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
