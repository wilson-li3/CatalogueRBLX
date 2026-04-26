"use client";

import { useLoader } from "@react-three/fiber";
import { MTLLoader } from "@/lib/MTLLoader";
import { OBJLoader } from "@/lib/OBJLoader";

export function Avatar({ data }) {
  // Load materials first, then mesh with materials applied
  const mtl = useLoader(MTLLoader, data.mtl);
  const obj = useLoader(
    OBJLoader,
    data.obj,
    (loader) => {
      loader.setMaterials(mtl);
    },
    () => {} // suppress loading errors on retry
  );

  return (
    <primitive
      object={obj}
      scale={2}
      // The OBJ data from Roblox is offset ~100+ units in Y axis
      position={[0, -206, -5]}
      // Rotate 180° so avatar faces the camera
      rotation={[0, Math.PI, 0]}
    />
  );
}
