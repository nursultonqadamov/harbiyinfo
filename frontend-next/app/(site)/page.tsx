import Link from "next/link";
import { getArticles, getEquipmentList } from "@/lib/api/public";
import PosterCard from "@/components/site/PosterCard";
import styles from "@/components/site/site.module.css";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [news, equipment] = await Promise.all([
    getArticles("news").catch(() => ({ results: [] as Awaited<ReturnType<typeof getArticles>>["results"] })),
    getEquipmentList().catch(() => ({ results: [] as Awaited<ReturnType<typeof getEquipmentList>>["results"] })),
  ]);

  return (
    <>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Harbiy ma&apos;lumot sayti</h1>
        <p className={styles.heroSubtitle}>
          Harbiy texnika va qurol-yarog&apos;, so&apos;nggi yangiliklar, urushlar tarixi va qo&apos;llanmalar
          bitta manbada.
        </p>
      </section>

      <div className={styles.page}>
        <div className={styles.sectionHeading}>
          <h2>So&apos;nggi yangiliklar</h2>
          <Link href="/yangiliklar" className={styles.sectionLink}>
            Barchasi &rarr;
          </Link>
        </div>
        {news.results.length === 0 ? (
          <p className={styles.empty}>Hozircha yangiliklar yo&apos;q.</p>
        ) : (
          <div className={styles.grid}>
            {news.results.slice(0, 3).map((item) => (
              <PosterCard
                key={item.slug}
                href={`/yangiliklar/${item.slug}`}
                image={item.cover_image}
                badge="Yangilik"
                title={item.title_uz}
                excerpt={item.excerpt_uz}
              />
            ))}
          </div>
        )}

        <div className={styles.sectionHeading}>
          <h2>Texnika va qurollar</h2>
          <Link href="/texnika" className={styles.sectionLink}>
            Barchasi &rarr;
          </Link>
        </div>
        {equipment.results.length === 0 ? (
          <p className={styles.empty}>Hozircha texnika qo&apos;shilmagan.</p>
        ) : (
          <div className={styles.grid}>
            {equipment.results.slice(0, 3).map((item) => (
              <PosterCard
                key={item.slug}
                href={`/texnika/${item.slug}`}
                image={item.cover_image}
                badge={item.category?.name_uz}
                title={item.title_uz}
                excerpt={item.short_description_uz}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
