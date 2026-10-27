import Link from "next/link";
import styles from "./Header.module.css";

const NAV = [
  { href: "/", label: "Bosh sahifa" },
  { href: "/yangiliklar", label: "Yangiliklar" },
  { href: "/texnika", label: "Texnika va qurollar" },
  { href: "/tarix", label: "Tarix va qo'llanmalar" },
];

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          Harbiy<span className={styles.brandAccent}>Info</span>
        </Link>
        <nav className={styles.nav}>
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
