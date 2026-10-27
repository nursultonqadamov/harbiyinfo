import { notFound } from "next/navigation";
import { adminGetEquipment, adminGetCategories, adminGetModels3D } from "@/lib/admin/data";
import {
  saveEquipment,
  uploadEquipmentMedia,
  deleteEquipmentMedia,
  addEquipmentSpec,
  deleteEquipmentSpec,
} from "@/lib/admin/actions";
import EquipmentForm from "@/components/admin/EquipmentForm";
import MediaManager from "@/components/admin/MediaManager";
import SpecsManager from "@/components/admin/SpecsManager";
import styles from "@/components/admin/admin.module.css";

export default async function EditEquipmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [equipment, categories, models3d] = await Promise.all([
    adminGetEquipment(slug).catch(() => null),
    adminGetCategories(),
    adminGetModels3D(),
  ]);
  if (!equipment) notFound();

  const viewerModels = models3d.results.map((m) => ({ slug: m.slug, title: m.title }));

  return (
    <div>
      <h1 className={styles.pageTitle} style={{ marginBottom: 24 }}>
        {equipment.title_uz}
      </h1>
      <EquipmentForm
        action={saveEquipment.bind(null, slug)}
        initial={equipment}
        categories={categories.results}
        viewerModels={viewerModels}
      />

      <SpecsManager
        items={equipment.specs.map((spec) => ({
          spec,
          deleteAction: deleteEquipmentSpec.bind(null, slug, spec.id),
        }))}
        addAction={addEquipmentSpec.bind(null, slug)}
      />

      <MediaManager
        items={equipment.media.map((asset) => ({
          asset,
          deleteAction: deleteEquipmentMedia.bind(null, slug, asset.id),
        }))}
        uploadAction={uploadEquipmentMedia.bind(null, slug)}
      />
    </div>
  );
}
