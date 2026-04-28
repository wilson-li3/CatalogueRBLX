"use client";

import { useGLTF } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

export function Mannequin({ color = "#c8b8a4" }) {
  const { scene } = useGLTF("/models/ClassicMannequin.glb");
  const ref = useRef(null);

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(color),
          roughness: 0.7,
          metalness: 0.05,
        });
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return clone;
  }, [scene, color]);

  return (
    <primitive
      ref={ref}
      object={clonedScene}
      scale={1}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

useGLTF.preload("/models/ClassicMannequin.glb");
