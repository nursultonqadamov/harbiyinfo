"use client";

import { Html } from "@react-three/drei";
import { useState } from "react";
import * as THREE from "three";

type HotspotProps = {
  position: THREE.Vector3;
  label: string;
  active: boolean;
  onClick: () => void;
  /** Direction (degrees) the leader line fans out to, so nearby parts don't
      stack their labels on top of each other. */
  angleDeg: number;
};

const LINE_LENGTH = 60;
const LINE_COLOR = "rgba(225, 225, 225, 0.55)";
const LINE_COLOR_ACTIVE = "rgba(255, 255, 255, 0.9)";

export default function Hotspot({ position, label, active, onClick, angleDeg }: HotspotProps) {
  const [hovered, setHovered] = useState(false);
  const highlighted = active || hovered;
  const rad = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(rad) * LINE_LENGTH;
  const dy = Math.sin(rad) * LINE_LENGTH;
  const labelOnRight = dx >= 0;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };
  const handleOver = () => setHovered(true);
  const handleOut = () => setHovered(false);

  return (
    <Html position={position} center occlude zIndexRange={[10, 0]}>
      <div style={{ position: "relative", width: 0, height: 0 }}>
        {/* Leader line -- thin, extends away from the part into open space.
            Wrapped in a taller invisible hit area so it stays easy to click
            despite being visually thin. */}
        <div
          onClick={handleClick}
          onPointerOver={handleOver}
          onPointerOut={handleOut}
          style={{
            position: "absolute",
            left: 0,
            top: -6,
            width: LINE_LENGTH,
            height: 12,
            transformOrigin: "0 50%",
            transform: `rotate(${angleDeg}deg)`,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              height: 1,
              background: highlighted ? LINE_COLOR_ACTIVE : LINE_COLOR,
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Label chip at the end of the line. */}
        <div
          onClick={handleClick}
          onPointerOver={handleOver}
          onPointerOut={handleOut}
          style={{
            position: "absolute",
            left: dx,
            top: dy,
            transform: `translate(${labelOnRight ? "0" : "-100%"}, -50%)`,
            background: highlighted ? "#ffffff" : "rgba(10,10,10,0.9)",
            color: highlighted ? "#0a0a0a" : "#ffffff",
            border: `1px solid ${highlighted ? "#ffffff" : "#444"}`,
            borderRadius: 6,
            padding: "4px 10px",
            fontSize: 12,
            fontFamily: "Arial, Helvetica, sans-serif",
            whiteSpace: "nowrap",
            cursor: "pointer",
            transition: "all 120ms ease",
          }}
        >
          {label}
        </div>
      </div>
    </Html>
  );
}
