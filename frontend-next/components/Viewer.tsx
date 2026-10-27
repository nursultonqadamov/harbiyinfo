"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls, Html } from "@react-three/drei";
import * as THREE from "three";
import InteractiveModel, { PartInfo, ClosingPanel } from "@/components/InteractiveModel";
import Hotspot from "@/components/Hotspot";

type PartDisplay = { title: string; description: string };

function ModelMissingNotice({ modelUrl, publicPath }: { modelUrl: string; publicPath: string }) {
  return (
    <div style={styles.notice}>
      <h2 style={{ margin: 0, fontSize: 18 }}>3D model topilmadi</h2>
      <p style={{ marginTop: 12, lineHeight: 1.5 }}>
        <code>{modelUrl}</code> fayli yo&apos;q. Modelni (glTF/.glb formatda) yuklab oling va
        quyidagi joyga qo&apos;ying:
      </p>
      <code style={styles.path}>{publicPath}</code>
      <p style={{ marginTop: 12, opacity: 0.7 }}>Fayl qo&apos;yilgach, sahifani qayta yuklang (F5).</p>
    </div>
  );
}

function SceneContent({
  modelUrl,
  selectedMesh,
  onSelectToggle,
  onParts,
  parts,
  controlsRef,
  closingPanels,
  glassMeshNames,
  glassBaseOpacity,
  getPartDisplay,
}: {
  modelUrl: string;
  selectedMesh: string | null;
  onSelectToggle: (name: string) => void;
  onParts: (parts: PartInfo[]) => void;
  parts: PartInfo[];
  controlsRef: React.RefObject<CameraControls | null>;
  closingPanels?: ClosingPanel[];
  glassMeshNames?: Set<string>;
  glassBaseOpacity?: number;
  getPartDisplay: (rawName: string) => PartDisplay;
}) {
  // Zoom the camera to the selected part's bounding box, or back out to
  // frame the whole object when nothing is selected.
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls || parts.length === 0) return;

    if (selectedMesh) {
      const part = parts.find((p) => p.name === selectedMesh);
      if (part) {
        controls.fitToBox(part.box, true, { paddingLeft: 1, paddingRight: 1, paddingTop: 1, paddingBottom: 1 });
      }
    } else {
      const overall = parts.reduce((acc, p) => acc.union(p.box), new THREE.Box3());
      controls.fitToBox(overall, true, {
        paddingLeft: 1.5,
        paddingRight: 1.5,
        paddingTop: 1.5,
        paddingBottom: 1.5,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMesh, parts]);

  return (
    <>
      <ambientLight intensity={1.4} />
      <hemisphereLight intensity={1.2} groundColor="#444444" />
      <directionalLight position={[5, 10, 5]} intensity={2.5} />
      <directionalLight position={[-5, -5, -5]} intensity={1.5} />
      <directionalLight position={[-5, 8, -8]} intensity={1.5} />
      <InteractiveModel
        url={modelUrl}
        selectedMesh={selectedMesh}
        onSelect={onSelectToggle}
        onParts={onParts}
        closingPanels={closingPanels}
        glassMeshNames={glassMeshNames}
        glassBaseOpacity={glassBaseOpacity}
      />
      {parts.map((part, i) => (
        <Hotspot
          key={part.name}
          position={part.center}
          label={getPartDisplay(part.name).title}
          active={part.name === selectedMesh}
          onClick={() => onSelectToggle(part.name)}
          angleDeg={(360 / parts.length) * i}
        />
      ))}
      <CameraControls ref={controlsRef} />
    </>
  );
}

export type ViewerProps = {
  modelUrl: string;
  publicPath: string;
  creditText: string;
  hintText: string;
  /** Plain data rather than a function -- this is passed down from a
   * Server Component (fetched from Django), and functions aren't
   * serializable across that boundary. */
  partInfo: Record<string, PartDisplay>;
  closingPanels?: ClosingPanel[];
  glassMeshNames?: Set<string>;
  glassBaseOpacity?: number;
};

export default function Viewer({
  modelUrl,
  publicPath,
  creditText,
  hintText,
  partInfo,
  closingPanels,
  glassMeshNames,
  glassBaseOpacity,
}: ViewerProps) {
  const [modelExists, setModelExists] = useState<boolean | null>(null);
  const [selectedMesh, setSelectedMesh] = useState<string | null>(null);
  const [parts, setParts] = useState<PartInfo[]>([]);
  const controlsRef = useRef<CameraControls | null>(null);

  useEffect(() => {
    fetch(modelUrl, { method: "HEAD" })
      .then((res) => setModelExists(res.ok))
      .catch(() => setModelExists(false));
  }, [modelUrl]);

  function toggleSelect(name: string) {
    setSelectedMesh((prev) => (prev === name ? null : name));
  }

  function getPartDisplay(rawName: string): PartDisplay {
    return partInfo[rawName] ?? { title: rawName, description: "Tavsif hali qo'shilmagan." };
  }

  const display = selectedMesh ? getPartDisplay(selectedMesh) : null;

  return (
    <div style={styles.container}>
      {modelExists === false && <ModelMissingNotice modelUrl={modelUrl} publicPath={publicPath} />}

      {modelExists && (
        <>
          <div style={styles.topBar}>
            {display ? (
              <>
                <h2 style={{ margin: 0, fontSize: 20 }}>{display.title}</h2>
                <p style={{ margin: "6px 0 0", opacity: 0.8, lineHeight: 1.5 }}>{display.description}</p>
              </>
            ) : (
              <p style={{ margin: 0, opacity: 0.65 }}>{hintText}</p>
            )}
          </div>

          <Canvas
            camera={{ position: [8, 4, 8], fov: 45 }}
            style={{ background: "#3d3d3d" }}
            onPointerMissed={() => setSelectedMesh(null)}
          >
            <Suspense
              fallback={
                <Html center style={{ color: "#fff" }}>
                  Model yuklanmoqda...
                </Html>
              }
            >
              <SceneContent
                modelUrl={modelUrl}
                selectedMesh={selectedMesh}
                onSelectToggle={toggleSelect}
                onParts={setParts}
                parts={parts}
                controlsRef={controlsRef}
                closingPanels={closingPanels}
                glassMeshNames={glassMeshNames}
                glassBaseOpacity={glassBaseOpacity}
                getPartDisplay={getPartDisplay}
              />
            </Suspense>
          </Canvas>

          <div style={styles.credit}>
            {creditText}
            {parts.length > 0 && <span style={{ opacity: 0.5 }}> · {parts.length} ta qism</span>}
          </div>
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "fixed",
    inset: 0,
    background: "#3d3d3d",
    color: "#fff",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  notice: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "#111",
    border: "1px solid #333",
    borderRadius: 12,
    padding: "28px 32px",
    maxWidth: 480,
  },
  path: {
    display: "block",
    marginTop: 8,
    padding: "8px 12px",
    background: "#000",
    borderRadius: 6,
    fontSize: 13,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5,
    background: "linear-gradient(to bottom, rgba(0,0,0,0.85), rgba(0,0,0,0))",
    padding: "24px 28px 48px",
    pointerEvents: "none",
  },
  credit: {
    position: "absolute",
    bottom: 12,
    left: 16,
    fontSize: 12,
    opacity: 0.6,
  },
};
