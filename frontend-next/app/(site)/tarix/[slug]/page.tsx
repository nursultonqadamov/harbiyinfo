import { notFound } from "next/navigation";
import { getArticle } from "@/lib/api/public";
import MediaGallery from "@/components/site/MediaGallery";
import styles from "@/components/site/site.module.css";

export const dynamic = "force-dynamic";

export default async function HistoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug).catch(() => null);

  if (!article) notFound();

  return (
    <div className={styles.page}>
      <span className={styles.badge}>{article.section === "history" ? "Urushlar tarixi" : "Qo'llanma"}</span>
      <h1 className={styles.pageTitle} style={{ marginTop: 12 }}>
        {article.title_uz}
      </h1>

      {article.cover_image && <img src={article.cover_image} alt="" className={styles.detailCover} />}

      <div className={styles.detailBody}>{article.body_uz}</div>

      <MediaGallery media={article.media} />
    </div>
  );
}
