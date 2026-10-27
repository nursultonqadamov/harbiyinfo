import { notFound } from "next/navigation";
import { adminGetModel3D } from "@/lib/admin/data";
import { saveModel3D } from "@/lib/admin/actions";
import Model3DForm from "@/components/admin/Model3DForm";
import Model3DLabeler from "@/components/admin/Model3DLabeler";
import styles from "@/components/admin/admin.module.css";

export default async function EditModel3DPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const model = await adminGetModel3D(slug).catch(() => null);
  if (!model) notFound();

  return (
    <div>
      <h1 className={styles.pageTitle} style={{ marginBottom: 24 }}>
        {model.title}
      </h1>
      <Model3DForm action={saveModel3D.bind(null, slug)} initial={model} />

      <Model3DLabeler slug={slug} modelUrl={model.file} initialParts={model.parts} />
    </div>
  );
}
