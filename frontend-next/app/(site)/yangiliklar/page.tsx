import { getArticles } from "@/lib/api/public";
import PosterCard from "@/components/site/PosterCard";
import styles from "@/components/site/site.module.css";

export const dynamic = "force-dynamic";

export default async function NewsListPage() {
  const news = await getArticles("news").catch(() => ({ results: [] as Awaited<ReturnType<typeof getArticles>>["results"] }));

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Yangiliklar</h1>
        <p className={styles.pageSubtitle}>Harbiy soha bo&apos;yicha so&apos;nggi yangiliklar.</p>
      </div>

      {news.results.length === 0 ? (
        <p className={styles.empty}>Hozircha yangiliklar yo&apos;q.</p>
      ) : (
        <div className={styles.grid}>
          {news.results.map((item) => (
            <PosterCard
              key={item.slug}
              href={`/yangiliklar/${item.slug}`}
              image={item.cover_image}
              meta={item.published_at ? new Date(item.published_at).toLocaleDateString("uz-UZ") : undefined}
              title={item.title_uz}
              excerpt={item.excerpt_uz}
            />
          ))}
        </div>
      )}
    </div>
  );
}
