import Link from "next/link";
import { getArticles, type ArticleSection } from "@/lib/api/public";
import PosterCard from "@/components/site/PosterCard";
import styles from "@/components/site/site.module.css";

export const dynamic = "force-dynamic";

const FILTERS: { value: ArticleSection | undefined; label: string }[] = [
  { value: undefined, label: "Barchasi" },
  { value: "history", label: "Urushlar tarixi" },
  { value: "manual", label: "Qo'llanmalar" },
];

export default async function HistoryListPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const { section } = await searchParams;
  const active = section === "history" || section === "manual" ? section : undefined;

  const [history, manuals] = await Promise.all([
    getArticles("history").catch(() => ({ results: [] as Awaited<ReturnType<typeof getArticles>>["results"] })),
    getArticles("manual").catch(() => ({ results: [] as Awaited<ReturnType<typeof getArticles>>["results"] })),
  ]);

  const items = active === "history" ? history.results : active === "manual" ? manuals.results : [...history.results, ...manuals.results];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Tarix va qo&apos;llanmalar</h1>
        <p className={styles.pageSubtitle}>Urushlar tarixi bo&apos;yicha maqolalar va amaliy qo&apos;llanmalar.</p>
      </div>

      <div className={styles.filterRow}>
        {FILTERS.map((f) => (
          <Link
            key={f.label}
            href={f.value ? `/tarix?section=${f.value}` : "/tarix"}
            className={`${styles.filterLink} ${active === f.value ? styles.filterLinkActive : ""}`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <p className={styles.empty}>Hozircha maqolalar yo&apos;q.</p>
      ) : (
        <div className={styles.grid}>
          {items.map((item) => (
            <PosterCard
              key={item.slug}
              href={`/tarix/${item.slug}`}
              image={item.cover_image}
              badge={item.section === "history" ? "Tarix" : "Qo'llanma"}
              title={item.title_uz}
              excerpt={item.excerpt_uz}
            />
          ))}
        </div>
      )}
    </div>
  );
}
