"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";
import InteractiveModel, { PartInfo } from "@/components/InteractiveModel";
import { saveModel3DParts, type PartLabelInput } from "@/lib/admin/actions";
import type { Model3DPart } from "@/lib/api/public";
import styles from "./admin.module.css";

type RowState = { title_uz: string; description_uz: string };

export default function Model3DLabeler({
  slug,
  modelUrl,
  initialParts,
}: {
  slug: string;
  modelUrl: string;
  initialParts: Model3DPart[];
}) {
  const [parts, setParts] = useState<PartInfo[]>([]);
  const [selectedMesh, setSelectedMesh] = useState<string | null>(null);
  const [rows, setRows] = useState<Record<string, RowState>>(() =>
    Object.fromEntries(initialParts.map((p) => [p.mesh_name, { title_uz: p.title_uz, description_uz: p.description_uz }]))
  );
  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">("idle");
  const [isPending, startTransition] = useTransition();
  const controlsRef = useRef<CameraControls | null>(null);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const meshNames = useMemo(() => parts.map((p) => p.name), [parts]);

  function updateRow(meshName: string, field: keyof RowState, value: string) {
    setRows((prev) => ({
      ...prev,
      [meshName]: { title_uz: prev[meshName]?.title_uz ?? "", description_uz: prev[meshName]?.description_uz ?? "", [field]: value },
    }));
  }

  function selectMesh(meshName: string) {
    setSelectedMesh((prev) => (prev === meshName ? null : meshName));
    rowRefs.current[meshName]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function handleSave() {
    setSaveState("idle");
    const payload: PartLabelInput[] = meshNames.map((meshName) => ({
      mesh_name: meshName,
      title_uz: rows[meshName]?.title_uz ?? "",
      description_uz: rows[meshName]?.description_uz ?? "",
    }));
    startTransition(async () => {
      try {
        await saveModel3DParts(slug, payload);
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    });
  }

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Qismlarni belgilash</h2>
      <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginBottom: 16 }}>
        Modelni sichqoncha bilan aylantiring, qismni bosing -- o&apos;ng tomonda shu qismning qatori
        ajratiladi. Har bir qism uchun nom va tavsif kiriting, so&apos;ng saqlang.
      </p>

      <div style={{ display: "flex", gap: 20, height: 480 }}>
        <div style={{ flex: "1 1 50%", background: "#000", borderRadius: 10, overflow: "hidden" }}>
          <Canvas camera={{ position: [8, 4, 8], fov: 45 }} style={{ background: "#3d3d3d" }}>
            <ambientLight intensity={1.4} />
            <hemisphereLight intensity={1.2} groundColor="#444444" />
            <directionalLight position={[5, 10, 5]} intensity={2.5} />
            <directionalLight position={[-5, -5, -5]} intensity={1.5} />
            <InteractiveModel url={modelUrl} selectedMesh={selectedMesh} onSelect={selectMesh} onParts={setParts} />
            <CameraControls ref={controlsRef} />
          </Canvas>
        </div>

        <div style={{ flex: "1 1 50%", overflowY: "auto", paddingRight: 8 }}>
          {parts.length === 0 && <p style={{ color: "var(--color-text-muted)" }}>Model yuklanmoqda...</p>}
          {parts.map((part) => (
            <div
              key={part.name}
              ref={(el) => {
                rowRefs.current[part.name] = el;
              }}
              onClick={() => selectMesh(part.name)}
              style={{
                padding: 12,
                marginBottom: 8,
                borderRadius: 8,
                border: `1px solid ${selectedMesh === part.name ? "var(--color-accent)" : "var(--color-border)"}`,
                background: selectedMesh === part.name ? "var(--color-surface-hover)" : "var(--color-surface)",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 6, fontFamily: "monospace" }}>
                {part.name}
              </div>
              <input
                type="text"
                placeholder="Nomi"
                value={rows[part.name]?.title_uz ?? ""}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => updateRow(part.name, "title_uz", e.target.value)}
                style={{
                  width: "100%",
                  marginBottom: 6,
                  padding: "6px 8px",
                  background: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 4,
                  color: "var(--color-text)",
                }}
              />
              <textarea
                placeholder="Tavsif"
                value={rows[part.name]?.description_uz ?? ""}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => updateRow(part.name, "description_uz", e.target.value)}
                style={{
                  width: "100%",
                  minHeight: 50,
                  padding: "6px 8px",
                  background: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 4,
                  color: "var(--color-text)",
                  fontFamily: "inherit",
                  fontSize: 13,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <button type="button" onClick={handleSave} disabled={isPending || parts.length === 0} className={styles.submitButton}>
        {isPending ? "Saqlanmoqda..." : "Barcha qismlarni saqlash"}
      </button>
      {saveState === "saved" && <span style={{ marginLeft: 12, color: "var(--color-accent)" }}>Saqlandi.</span>}
      {saveState === "error" && <span style={{ marginLeft: 12, color: "var(--color-danger)" }}>Xatolik yuz berdi.</span>}
    </div>
  );
}
