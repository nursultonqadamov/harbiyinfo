import Link from "next/link";
import { notFound } from "next/navigation";
import { getEquipment } from "@/lib/api/public";
import MediaGallery from "@/components/site/MediaGallery";
import styles from "@/components/site/site.module.css";

export const dynamic = "force-dynamic";

export default async function EquipmentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const equipment = await getEquipment(slug).catch(() => null);

  if (!equipment) notFound();

  return (
    <div className={styles.page}>
      {equipment.category && <span className={styles.badge}>{equipment.category.name_uz}</span>}
      <h1 className={styles.pageTitle} style={{ marginTop: 12 }}>
        {equipment.title_uz}
      </h1>
      <p className={styles.detailMeta}>{equipment.short_description_uz}</p>

      {equipment.cover_image && <img src={equipment.cover_image} alt="" className={styles.detailCover} />}

      <div className={styles.detailBody}>{equipment.full_description_uz}</div>

      {equipment.specs.length > 0 && (
        <table className={styles.specTable}>
          <tbody>
            {equipment.specs.map((spec) => (
              <tr key={spec.id}>
                <td>{spec.label}</td>
                <td>{spec.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <MediaGallery media={equipment.media} />

      {equipment.viewer_slug && (
        <Link href={`/${equipment.viewer_slug}`} className={styles.button}>
          3D ko&apos;rinishda ko&apos;rish
        </Link>
      )}
    </div>
  );
}
