"use client";

import { useMemo } from "react";
import * as THREE from "three";

// Mannequin attachment positions in GLB stud coordinates
// Mannequin faces +Z, feet at Y≈-1.97, head top at Y≈3.0
const BODY_ATTACHMENTS = {
  HatAttachment:           [0, 3.05, 0],
  HairAttachment:          [0, 3.05, 0],
  FaceFrontAttachment:     [0, 2.415, 0.6],
  FaceCenterAttachment:    [0, 2.415, 0],
  NeckAttachment:          [0, 2.0, 0],
  BodyFrontAttachment:     [0, 1.255, 0.5],
  BodyBackAttachment:      [0, 1.255, -0.5],
  LeftCollarAttachment:    [-0.8, 1.955, 0],
  RightCollarAttachment:   [0.8, 1.955, 0],
  LeftShoulderAttachment:  [-1.0, 1.755, 0],
  RightShoulderAttachment: [1.0, 1.755, 0],
  WaistCenterAttachment:   [0, 0.460, 0],
  WaistFrontAttachment:    [0, 0.460, 0.5],
  WaistBackAttachment:     [0, 0.460, -0.5],
  LeftGripAttachment:      [-1.5, 0.1, 0],
  RightGripAttachment:     [1.5, 0.1, 0],
};

// Fallback: map catalog item type → attachment name
const TYPE_TO_ATTACHMENT = {
  Hat: "HatAttachment",
  Hair: "HairAttachment",
  Face: "FaceFrontAttachment",
  Neck: "NeckAttachment",
  Back: "BodyBackAttachment",
  Shirt: "BodyFrontAttachment",
  TShirt: "BodyFrontAttachment",
  Pants: "WaistCenterAttachment",
  Shoes: "WaistCenterAttachment",
  "Neck Accessories": "NeckAttachment",
  "Shoulder Accessories": "RightShoulderAttachment",
  "Waist Accessories": "WaistCenterAttachment",
  "Front Accessories": "BodyFrontAttachment",
};

export function AccessoryMesh({ data, itemType }) {
  const { geometry, material, position } = useMemo(() => {
    // ── 1. Build BufferGeometry from parsed mesh data ──
    const geo = new THREE.BufferGeometry();
    const verts = new Float32Array(data.vertices);
    const norms = new Float32Array(data.normals);
    const uv = new Float32Array(data.uvs);
    const idx = new Uint32Array(data.indices);

    geo.setAttribute("position", new THREE.BufferAttribute(verts, 3));
    geo.setAttribute("normal", new THREE.BufferAttribute(norms, 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    geo.setIndex(new THREE.BufferAttribute(idx, 1));

    // ── 2. Apply SpecialMesh Scale ──
    const s = data.meshScale;
    if (s.x !== 1 || s.y !== 1 || s.z !== 1) {
      geo.applyMatrix4(new THREE.Matrix4().makeScale(s.x, s.y, s.z));
    }

    // ── 3. Apply SpecialMesh Offset (in Roblox local coords) ──
    const o = data.meshOffset;
    if (o.x !== 0 || o.y !== 0 || o.z !== 0) {
      geo.applyMatrix4(new THREE.Matrix4().makeTranslation(o.x, o.y, o.z));
    }

    // ── 4. Rotate 180° around Y to convert from Roblox (-Z front) to mannequin (+Z front) ──
    // This is a scale of (-1, 1, -1) with determinant=1, so winding is preserved.
    geo.applyMatrix4(new THREE.Matrix4().makeScale(-1, 1, -1));

    geo.computeBoundingSphere();

    // ── 5. Compute world position using attachment math ──
    // bodyAttach is in mannequin coords, accAttach is in Roblox coords.
    // After flipping the geometry (step 4), the attachment point in mannequin coords is:
    //   accAttach_mannequin = (-accAttach.x, accAttach.y, -accAttach.z)
    // Handle center = bodyAttach - accAttach_mannequin
    const attName = data.attachmentName || TYPE_TO_ATTACHMENT[itemType] || "HatAttachment";
    const bodyAttach = BODY_ATTACHMENTS[attName] || BODY_ATTACHMENTS.HatAttachment;
    const acc = data.attachmentPosition;

    const pos = [
      bodyAttach[0] - (-acc.x),  // bodyAttach.x + accAttach.x
      bodyAttach[1] - acc.y,
      bodyAttach[2] - (-acc.z),  // bodyAttach.z + accAttach.z
    ];

    // ── 6. Create material ──
    let mat;
    if (data.texture) {
      const tex = new THREE.TextureLoader().load(data.texture);
      tex.flipY = false; // V was already flipped in the mesh parser
      tex.colorSpace = THREE.SRGBColorSpace;
      mat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.6,
        metalness: 0.05,
        side: THREE.DoubleSide,
      });
    } else {
      mat = new THREE.MeshStandardMaterial({
        color: 0xc8b8a4,
        roughness: 0.6,
        metalness: 0.05,
        side: THREE.DoubleSide,
      });
    }

    return { geometry: geo, material: mat, position: pos };
  }, [data, itemType]);

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={position}
      castShadow
      receiveShadow
    />
  );
}
