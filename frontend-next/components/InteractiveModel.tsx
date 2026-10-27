"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const SELECTED_OPACITY = 1;
const DIMMED_OPACITY = 0.12;
const SELECTED_EMISSIVE = new THREE.Color(0xffffff);
const EMISSIVE_INTENSITY = 0.6;
const CLOSE_DURATION_SECONDS = 1.2;

export type PartInfo = {
  name: string;
  center: THREE.Vector3;
  box: THREE.Box3;
};

/** A hinged sub-object (named node) that ships "open" in the source file and
 * should ease to a known-good closed rotation.x on load. */
export type ClosingPanel = {
  names: string[];
  closedDegX: number;
};

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function computeParts(scene: THREE.Object3D): PartInfo[] {
  scene.updateMatrixWorld(true);
  const parts: PartInfo[] = [];
  scene.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const box = new THREE.Box3().setFromObject(child);
    const center = box.getCenter(new THREE.Vector3());
    parts.push({ name: child.name || "(nomsiz qism)", center, box });
  });
  return parts;
}

type InteractiveModelProps = {
  url: string;
  selectedMesh: string | null;
  onSelect: (meshName: string) => void;
  onParts: (parts: PartInfo[]) => void;
  /** Hinged panels (e.g. a radome or canopy) that ship open and should
   * animate closed once on load. Optional -- omit for models with no such
   * panels. */
  closingPanels?: ClosingPanel[];
  /** Mesh names that should always read as translucent glass, even when
   * nothing is selected (the base x-ray logic otherwise forces full opacity
   * in that state). Optional. */
  glassMeshNames?: Set<string>;
  glassBaseOpacity?: number;
};

export default function InteractiveModel({
  url,
  selectedMesh,
  onSelect,
  onParts,
  closingPanels = [],
  glassMeshNames = new Set(),
  glassBaseOpacity = 0.35,
}: InteractiveModelProps) {
  const { scene } = useGLTF(url);
  const closingRef = useRef<{ obj: THREE.Object3D; fromDeg: number; toDeg: number }[]>([]);
  const progressRef = useRef(0);

  // Each mesh gets its own cloned material -- glTF exporters commonly share
  // one material across many meshes (e.g. all "metal" surfaces), so without
  // cloning, dimming one mesh would dim every other mesh sharing that
  // material too.
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = child.material;
        child.material = Array.isArray(material)
          ? material.map((m) => m.clone())
          : material.clone();
      }
    });
    return clone;
  }, [scene]);

  useEffect(() => {
    progressRef.current = 0;
    closingRef.current = closingPanels.flatMap(({ names, closedDegX }) =>
      names
        .map((name) => clonedScene.getObjectByName(name))
        .filter((obj): obj is THREE.Object3D => !!obj)
        .map((obj) => ({ obj, fromDeg: (obj.rotation.x * 180) / Math.PI, toDeg: closedDegX }))
    );
    onParts(computeParts(clonedScene));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clonedScene]);

  useFrame((_, delta) => {
    if (progressRef.current >= 1 || closingRef.current.length === 0) return;
    progressRef.current = Math.min(1, progressRef.current + delta / CLOSE_DURATION_SECONDS);
    const t = easeOutCubic(progressRef.current);
    for (const { obj, fromDeg, toDeg } of closingRef.current) {
      obj.rotation.x = (THREE.MathUtils.lerp(fromDeg, toDeg, t) * Math.PI) / 180;
    }

    if (progressRef.current >= 1) {
      // Panels finished swinging shut -- their bounding boxes (and hence
      // hotspot anchor points) moved, so recompute and re-report them once
      // rather than every frame of the animation.
      onParts(computeParts(clonedScene));
    }
  });

  useEffect(() => {
    clonedScene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      const isSelected = selectedMesh === null || child.name === selectedMesh;
      const isGlass = glassMeshNames.has(child.name);

      for (const mat of materials) {
        mat.transparent = true;
        if (selectedMesh === null) {
          mat.opacity = isGlass ? glassBaseOpacity : 1;
        } else {
          mat.opacity = isSelected ? SELECTED_OPACITY : DIMMED_OPACITY;
        }

        if ("emissive" in mat) {
          const standardMat = mat as THREE.MeshStandardMaterial;
          standardMat.emissive = isSelected && selectedMesh !== null ? SELECTED_EMISSIVE : new THREE.Color(0x000000);
          standardMat.emissiveIntensity = EMISSIVE_INTENSITY;
        }
        mat.depthWrite = isGlass ? false : selectedMesh === null || isSelected;
        mat.needsUpdate = true;
      }
    });
  }, [clonedScene, selectedMesh, glassMeshNames, glassBaseOpacity]);

  return (
    <primitive
      object={clonedScene}
      onClick={(e: { object: THREE.Object3D; stopPropagation: () => void }) => {
        e.stopPropagation();
        onSelect(e.object.name || "(nomsiz qism)");
      }}
    />
  );
}
