"use client";

import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";

export default function StarBackground() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        pointerEvents: "none",
        background: "#0b0f1a", // 🔥 dark space fallback
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 1] }}
        gl={{ alpha: true }} // ✅ allows transparency
      >
        {/* 🔥 remove white background */}
        <color attach="background" args={["#0b0f1a"]} />

        <Stars
          radius={300}
          depth={100}
          count={8000}
          factor={7}
          saturation={0}
          fade
          speed={1.5}
        />
      </Canvas>
    </div>
  );
}