"use client";

import { useLoader } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { MTLLoader } from "@/lib/MTLLoader";
import { OBJLoader } from "@/lib/OBJLoader";

// Mannequin attachment positions in GLB stud coordinates
// Mannequin faces +Z, centered at X=0, feet at Y≈-1.97, head top at Y≈3.0
const MANNEQUIN_ATTACHMENTS = {
  HatAttachment:          [0, 3.15, 0],
  HairAttachment:         [0, 3.15, 0],
  FaceFrontAttachment:    [0, 2.415, 0.6],
  FaceCenterAttachment:   [0, 2.415, 0],
  NeckAttachment:         [0, 2.255, 0],
  BodyFrontAttachment:    [0, 1.255, 0.5],
  BodyBackAttachment:     [0, 1.255, -0.5],
  LeftCollarAttachment:   [-0.8, 1.955, 0],
  RightCollarAttachment:  [0.8, 1.955, 0],
  LeftShoulderAttachment: [-1.0, 1.755, 0],
  RightShoulderAttachment:[1.0, 1.755, 0],
  WaistCenterAttachment:  [0, 0.460, 0],
  WaistFrontAttachment:   [0, 0.460, 0.5],
  WaistBackAttachment:    [0, 0.460, -0.5],
  LeftGripAttachment:     [-1.5, 0.1, 0],
  RightGripAttachment:    [1.5, 0.1, 0],
};

// Fallback: map item type to a default attachment name
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

// Scale from OBJ thumbnail space to mannequin stud space
// Mannequin is ~4.977 studs tall, avatar OBJ is ~5.506 units tall
const OBJ_SCALE = 4.977 / 5.506;

export function ItemMesh({ meshData, assetData, itemType }) {
  const mtl = useLoader(MTLLoader, meshData.mtl);
  const obj = useLoader(
    OBJLoader,
    meshData.obj,
    (loader) => {
      loader.setMaterials(mtl);
    },
    () => {}
  );

  // Clone the OBJ so each item gets its own independent Three.js object
  // (useLoader caches by URL and returns the same mutable reference)
  const clonedObj = useMemo(() => {
    const clone = obj.clone(true);
    // Disable frustum culling on all meshes — the primitive may be positioned
    // far from the camera target (AABB centering compensates) but Three.js
    // culls based on the mesh's local bounding sphere before our offset applies
    clone.traverse((child) => {
      child.frustumCulled = false;
    });
    return clone;
  }, [obj]);

  const computed = useMemo(() => {
    // --- Attachment target position ---
    const attName = assetData?.attachmentName || TYPE_TO_ATTACHMENT[itemType] || "HatAttachment";
    const bodyPoint = MANNEQUIN_ATTACHMENTS[attName] || MANNEQUIN_ATTACHMENTS.HatAttachment;
    const accOffset = assetData?.attachmentCFrame?.position || { x: 0, y: 0, z: 0 };
    const mo = assetData?.meshOffset || { x: 0, y: 0, z: 0 };

    // Position = bodyPoint - accOffset (Z flipped: Roblox front=-Z, mannequin front=+Z)
    const target = [
      bodyPoint[0] - accOffset.x + mo.x,
      bodyPoint[1] - accOffset.y + mo.y,
      bodyPoint[2] + accOffset.z - mo.z,
    ];

    // --- Determine rotation ---
    const camDir = meshData.camera?.direction;

    let xRot = 0;
    let yRot = 0;

    if (camDir) {
      const isOverhead = Math.abs(camDir.y) > 0.7;

      if (isOverhead) {
        // Camera is above (or below) the item — the mesh is flat in the XZ plane.
        // Apply X rotation to stand the mesh upright, then PI Y rotation to flip
        // from Roblox front (-Z) to our front (+Z).
        xRot = camDir.y > 0 ? Math.PI / 2 : -Math.PI / 2;
        yRot = Math.PI;
      } else {
        // Normal camera angle — use camera direction to orient item.
        // camera.direction points from item toward camera. The item's BACK faces
        // the camera (Roblox renders assets showing the front, but the OBJ geometry
        // has the item facing away from camera). Adding PI flips to face +Z.
        yRot = -Math.atan2(camDir.x, camDir.z) + Math.PI;
      }
    }

    // Apply CFrame rotation from RBXM attachment data (small orientation correction)
    const cfRot = assetData?.attachmentCFrame?.rotation;
    let cfX = 0, cfY = 0, cfZ = 0;
    if (cfRot && cfRot.length === 9) {
      const m = new THREE.Matrix4();
      // Roblox CFrame rotation is row-major; Three.js Matrix4.set() is row-major too
      m.set(
        cfRot[0], cfRot[1], cfRot[2], 0,
        cfRot[3], cfRot[4], cfRot[5], 0,
        cfRot[6], cfRot[7], cfRot[8], 0,
        0, 0, 0, 1
      );
      const euler = new THREE.Euler().setFromRotationMatrix(m, "YXZ");
      cfX = euler.x;
      cfY = euler.y;
      cfZ = euler.z;
    }

    const totalRotX = xRot + cfX;
    const totalRotY = yRot + cfY;
    const totalRotZ = cfZ;

    // --- Compute position by rotating AABB center ---
    const cx = (meshData.aabb.min.x + meshData.aabb.max.x) / 2;
    const cy = (meshData.aabb.min.y + meshData.aabb.max.y) / 2;
    const cz = (meshData.aabb.min.z + meshData.aabb.max.z) / 2;

    // Rotate the AABB center by the full rotation to find where it ends up,
    // then offset so it lands at the attachment target
    const center = new THREE.Vector3(cx, cy, cz);
    const rotEuler = new THREE.Euler(totalRotX, totalRotY, totalRotZ, "XYZ");
    center.applyEuler(rotEuler);

    const posX = target[0] - center.x * OBJ_SCALE;
    const posY = target[1] - center.y * OBJ_SCALE;
    const posZ = target[2] - center.z * OBJ_SCALE;

    return {
      position: [posX, posY, posZ],
      rotation: [totalRotX, totalRotY, totalRotZ],
    };
  }, [meshData, assetData, itemType]);

  return (
    <primitive
      object={clonedObj}
      scale={OBJ_SCALE}
      position={computed.position}
      rotation={computed.rotation}
      frustumCulled={false}
    />
  );
}
