import { saveArticle } from "@/lib/admin/actions";
import ArticleForm from "@/components/admin/ArticleForm";
import styles from "@/components/admin/admin.module.css";

export default function NewNewsPage() {
  return (
    <div>
      <h1 className={styles.pageTitle} style={{ marginBottom: 24 }}>
        Yangi yangilik
      </h1>
      <ArticleForm action={saveArticle.bind(null, null)} fixedSection="news" />
    </div>
  );
}
