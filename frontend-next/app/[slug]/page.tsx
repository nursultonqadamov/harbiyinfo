import Link from "next/link";
import { notFound } from "next/navigation";
import Viewer from "@/components/Viewer";
import { getModel3D } from "@/lib/api/public";

const DEFAULT_HINT = "Modeldagi nuqtalardan birini bosing -- kamera o'sha qismga yaqinlashadi.";

export default async function ModelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const model = await getModel3D(slug).catch(() => null);

  if (!model) {
    return (
      <div style={styles.notFound}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ margin: 0 }}>Model topilmadi: {slug}</h2>
          <p style={{ marginTop: 16 }}>
            <Link href="/" style={{ color: "#8ecbff" }}>
              Bosh sahifaga qaytish
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const partInfo = Object.fromEntries(
    model.parts.map((p) => [p.mesh_name, { title: p.title_uz || p.mesh_name, description: p.description_uz || "Tavsif hali qo'shilmagan." }])
  );
  const glassMeshNames = new Set(
    model.glass_mesh_names
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );

  return (
    <Viewer
      modelUrl={model.file}
      publicPath={model.file}
      creditText={model.credit_text}
      hintText={DEFAULT_HINT}
      partInfo={partInfo}
      closingPanels={model.closing_panels}
      glassMeshNames={glassMeshNames}
      glassBaseOpacity={model.glass_base_opacity}
    />
  );
}

const styles: Record<string, React.CSSProperties> = {
  notFound: {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#3d3d3d",
    color: "#fff",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
};
