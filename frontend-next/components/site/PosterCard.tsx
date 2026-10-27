import Link from "next/link";
import styles from "./site.module.css";

/** Shared poster-style card for every list/preview grid on the public site
 * (news, equipment, history/manual) -- one card design, one place to change
 * it, instead of each page re-implementing the same markup. */
export default function PosterCard({
  href,
  image,
  badge,
  meta,
  title,
  excerpt,
  footerBadge,
}: {
  href: string;
  image: string | null;
  badge?: string;
  meta?: string;
  title: string;
  excerpt?: string;
  /** Small secondary marker under the excerpt, e.g. "3D ko'rish mavjud". */
  footerBadge?: string;
}) {
  return (
    <Link href={href} className={styles.card}>
      <div className={styles.cardMedia}>
        {image ? <img src={image} alt="" className={styles.cardImg} /> : <div className={styles.cardImgFallback} />}
      </div>
      <div className={styles.cardScrim} />
      {badge && <span className={`${styles.badge} ${styles.cardBadge}`}>{badge}</span>}
      <div className={styles.cardBody}>
        {meta && <span className={styles.cardMeta}>{meta}</span>}
        <h3 className={styles.cardTitle}>{title}</h3>
        {excerpt && <p className={styles.cardExcerpt}>{excerpt}</p>}
        {footerBadge && <span className={styles.badge}>{footerBadge}</span>}
      </div>
    </Link>
  );
}
