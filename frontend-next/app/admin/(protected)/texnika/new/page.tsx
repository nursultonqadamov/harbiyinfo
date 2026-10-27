import { adminGetCategories, adminGetModels3D } from "@/lib/admin/data";
import { saveEquipment } from "@/lib/admin/actions";
import EquipmentForm from "@/components/admin/EquipmentForm";
import styles from "@/components/admin/admin.module.css";

export default async function NewEquipmentPage() {
  const [categories, models3d] = await Promise.all([adminGetCategories(), adminGetModels3D()]);
  const viewerModels = models3d.results.map((m) => ({ slug: m.slug, title: m.title }));

  return (
    <div>
      <h1 className={styles.pageTitle} style={{ marginBottom: 24 }}>
        Yangi texnika
      </h1>
      <EquipmentForm action={saveEquipment.bind(null, null)} categories={categories.results} viewerModels={viewerModels} />
    </div>
  );
}
