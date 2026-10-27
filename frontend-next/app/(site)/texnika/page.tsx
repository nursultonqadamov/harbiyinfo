import { getEquipmentList } from "@/lib/api/public";
import PosterCard from "@/components/site/PosterCard";
import styles from "@/components/site/site.module.css";

export const dynamic = "force-dynamic";

export default async function EquipmentListPage() {
  const equipment = await getEquipmentList().catch(() => ({ results: [] as Awaited<ReturnType<typeof getEquipmentList>>["results"] }));

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Texnika va qurollar</h1>
        <p className={styles.pageSubtitle}>Harbiy texnika va qurol-yarog&apos; katalogi.</p>
      </div>

      {equipment.results.length === 0 ? (
        <p className={styles.empty}>Hozircha texnika qo&apos;shilmagan.</p>
      ) : (
        <div className={styles.grid}>
          {equipment.results.map((item) => (
            <PosterCard
              key={item.slug}
              href={`/texnika/${item.slug}`}
              image={item.cover_image}
              badge={item.category?.name_uz}
              title={item.title_uz}
              excerpt={item.short_description_uz}
              footerBadge={item.viewer_slug ? "3D ko'rish mavjud" : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
