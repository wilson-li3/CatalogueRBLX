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

// Check if a 3x3 rotation matrix (flat array of 9) is identity
function isIdentityRotation(rot) {
  if (!rot || rot.length !== 9) return true;
  return (
    Math.abs(rot[0] - 1) < 0.001 && Math.abs(rot[1]) < 0.001 && Math.abs(rot[2]) < 0.001 &&
    Math.abs(rot[3]) < 0.001 && Math.abs(rot[4] - 1) < 0.001 && Math.abs(rot[5]) < 0.001 &&
    Math.abs(rot[6]) < 0.001 && Math.abs(rot[7]) < 0.001 && Math.abs(rot[8] - 1) < 0.001
  );
}

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

    // ── 2. Apply mesh Scale (SpecialMesh.Scale or MeshPart Size/InitialSize) ──
    const s = data.meshScale;
    if (s.x !== 1 || s.y !== 1 || s.z !== 1) {
      geo.applyMatrix4(new THREE.Matrix4().makeScale(s.x, s.y, s.z));
    }

    // ── 3. Apply SpecialMesh Offset (in Roblox local coords) ──
    const o = data.meshOffset;
    if (o.x !== 0 || o.y !== 0 || o.z !== 0) {
      geo.applyMatrix4(new THREE.Matrix4().makeTranslation(o.x, o.y, o.z));
    }

    // ── 4. Apply attachment CFrame rotation if non-identity ──
    const attRot = data.attachmentRotation;
    if (!isIdentityRotation(attRot)) {
      const m = new THREE.Matrix4();
      m.set(
        attRot[0], attRot[1], attRot[2], 0,
        attRot[3], attRot[4], attRot[5], 0,
        attRot[6], attRot[7], attRot[8], 0,
        0, 0, 0, 1
      );
      m.invert();
      geo.applyMatrix4(m);
    }

    // ── 5. Rotate 180° around Y to convert from Roblox (-Z front) to mannequin (+Z front) ──
    geo.applyMatrix4(new THREE.Matrix4().makeScale(-1, 1, -1));

    // ── 6. Resolve attachment name and compute position ──
    const attName = data.attachmentName || TYPE_TO_ATTACHMENT[itemType] || "HatAttachment";
    const bodyAttach = BODY_ATTACHMENTS[attName] || BODY_ATTACHMENTS.HatAttachment;
    const acc = data.attachmentPosition;

    const pos = [
      bodyAttach[0] - (-acc.x),
      bodyAttach[1] - acc.y,
      bodyAttach[2] - (-acc.z),
    ];

    // ── 7. Bounding-box normalization (per-axis for hair/hat, per-dim for others) ──
    geo.computeBoundingBox();
    const bbox = geo.boundingBox;
    const bboxWidth = bbox.max.x - bbox.min.x;
    const bboxHeight = bbox.max.y - bbox.min.y;
    const bboxDepth = bbox.max.z - bbox.min.z;

    const isHairOrHat = attName === "HairAttachment" || attName === "HatAttachment";
    const isFace = attName === "FaceFrontAttachment" || attName === "FaceCenterAttachment";

    let needsNormalization = false;
    let correction = 1;

    if (isFace) {
      const maxDim = Math.max(bboxWidth, bboxHeight, bboxDepth);
      if (maxDim > 1.5) {
        correction = 1.5 / maxDim;
        needsNormalization = true;
      }
    } else if (isHairOrHat) {
      const widthLimit = 2.0;
      const heightLimit = 4.0;
      const depthLimit = 2.0;
      const widthRatio = bboxWidth > widthLimit ? widthLimit / bboxWidth : 1;
      const heightRatio = bboxHeight > heightLimit ? heightLimit / bboxHeight : 1;
      const depthRatio = bboxDepth > depthLimit ? depthLimit / bboxDepth : 1;
      correction = Math.min(widthRatio, heightRatio, depthRatio);
      if (correction < 1) {
        needsNormalization = true;
      }
    } else {
      const maxDim = Math.max(bboxWidth, bboxHeight, bboxDepth);
      if (maxDim > 3.0) {
        correction = 3.0 / maxDim;
        needsNormalization = true;
      }
    }

    if (needsNormalization) {
      geo.scale(correction, correction, correction);
      geo.computeBoundingBox();
    }

    // ── 8. Diagnostic logging ──
    console.log(`[AccessoryMesh] assetId=${data.assetId || "unknown"}`, {
      attachmentName: attName,
      bbox: { w: bboxWidth.toFixed(2), h: bboxHeight.toFixed(2), d: bboxDepth.toFixed(2) },
      correction: correction.toFixed(3),
      normalized: needsNormalization,
      finalPosition: pos,
    });

    geo.computeBoundingSphere();

    // ── 9. Create material ──
    const isHairType = attName === "HairAttachment"
      || itemType === "Hair"
      || itemType === "HairAccessories";

    let mat;
    if (data.texture) {
      const tex = new THREE.TextureLoader().load(data.texture);
      tex.flipY = false;
      tex.colorSpace = THREE.SRGBColorSpace;

      if (isHairType) {
        // Alpha cutout mode — no z-fighting between hair strands
        mat = new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.6,
          metalness: 0.05,
          side: THREE.DoubleSide,
          alphaTest: 0.5,
          transparent: false,
          depthWrite: true,
          polygonOffset: true,
          polygonOffsetFactor: 1,
          polygonOffsetUnits: 1,
        });
      } else {
        // Normal items — allow partial transparency
        mat = new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.6,
          metalness: 0.05,
          side: THREE.DoubleSide,
          alphaTest: 0.1,
          transparent: true,
          depthWrite: true,
          polygonOffset: true,
          polygonOffsetFactor: 1,
          polygonOffsetUnits: 1,
        });
      }
    } else {
      mat = new THREE.MeshStandardMaterial({
        color: 0xc8b8a4,
        roughness: 0.6,
        metalness: 0.05,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      });
    }

    return { geometry: geo, material: mat, position: pos };
  }, [data, itemType]);

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={position}
      renderOrder={1}
      castShadow
      receiveShadow
    />
  );
}
