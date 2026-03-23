"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

export default function RocketScene() {
  return (
    <div style={{ height: "200px" }}>
      <Canvas camera={{ position: [0, 0, 3] }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[2, 2, 2]} />

        {/* 🚀 SIMPLE ROCKET MODEL */}
        <mesh>
          <coneGeometry args={[0.3, 1, 32]} />
          <meshStandardMaterial color="#00d9ff" />
        </mesh>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={3}
        />
      </Canvas>
    </div>
  );
}