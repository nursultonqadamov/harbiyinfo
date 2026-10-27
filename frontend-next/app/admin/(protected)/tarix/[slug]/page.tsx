import { notFound } from "next/navigation";
import { adminGetArticle } from "@/lib/admin/data";
import { saveArticle, uploadArticleMedia, deleteArticleMedia } from "@/lib/admin/actions";
import ArticleForm from "@/components/admin/ArticleForm";
import MediaManager from "@/components/admin/MediaManager";
import styles from "@/components/admin/admin.module.css";

export default async function EditHistoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await adminGetArticle(slug).catch(() => null);
  if (!article) notFound();

  const redirectPath = `/admin/tarix/${slug}`;

  return (
    <div>
      <h1 className={styles.pageTitle} style={{ marginBottom: 24 }}>
        {article.title_uz}
      </h1>
      <ArticleForm action={saveArticle.bind(null, slug)} initial={article} />

      <MediaManager
        items={article.media.map((asset) => ({
          asset,
          deleteAction: deleteArticleMedia.bind(null, slug, asset.id, redirectPath),
        }))}
        uploadAction={uploadArticleMedia.bind(null, slug, redirectPath)}
      />
    </div>
  );
}
