import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span>&copy; {new Date().getFullYear()} HarbiyInfo</span>
        <span className={styles.muted}>Harbiy texnika, tarix va qo&apos;llanmalar arxivi</span>
      </div>
    </footer>
  );
}
