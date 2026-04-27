"use client";

import { useLoader } from "@react-three/fiber";
import { MTLLoader } from "@/lib/MTLLoader";
import { OBJLoader } from "@/lib/OBJLoader";

// Map item type → target Y position in world space (after avatar scale+offset)
// Avatar renders with scale=2, position=[0,-206,-5], rotation=[0,PI,0]
// Body part world Y values:
//   Head top=4.4, Head=3.0, Neck=1.5, Shoulders=0, Torso=-1, Waist=-3, Feet=-6
const TYPE_TARGET_Y = {
  // Catalog category names (from lib/roblox.js guessType / CATEGORY_CONFIG)
  Hat: 4.4,
  Hair: 4.4,
  Face: 2.8,
  Neck: 1.5,
  Back: 0,
  Shirt: -1,
  Pants: -3,
  TShirt: -1,
  Shoes: -6,
  // Roblox API type strings
  "Neck Accessories": 1.5,
  "Shoulder Accessories": 0,
  "Waist Accessories": -3,
  "Front Accessories": -1,
  // Full/alternate names
  HairAccessory: 4.4,
  "Hair Accessory": 4.4,
  FaceAccessory: 2.8,
  "Face Accessory": 2.8,
  NeckAccessory: 1.5,
  "Neck Accessory": 1.5,
  ShoulderAccessory: 0,
  "Shoulder Accessory": 0,
  BackAccessory: 0,
  "Back Accessory": 0,
  FrontAccessory: -1,
  "Front Accessory": -1,
  WaistAccessory: -3,
  "Waist Accessory": -3,
};

export function ItemMesh({ data, avatarAabb, itemType }) {
  const mtl = useLoader(MTLLoader, data.mtl);
  const obj = useLoader(
    OBJLoader,
    data.obj,
    (loader) => {
      loader.setMaterials(mtl);
    },
    () => {}
  );

  const scale = 2;

  // Item AABB center in its own coordinate space
  const cx = (data.aabb.min.x + data.aabb.max.x) / 2;
  const cy = (data.aabb.min.y + data.aabb.max.y) / 2;
  const cz = (data.aabb.min.z + data.aabb.max.z) / 2;

  // With rotation=[0, PI, 0], a vertex (vx, vy, vz) renders at:
  //   worldX = -vx*scale + posX
  //   worldY =  vy*scale + posY
  //   worldZ = -vz*scale + posZ
  //
  // To place item center at target (tx, ty, tz):
  //   posX = tx + cx*scale
  //   posY = ty - cy*scale
  //   posZ = tz + cz*scale

  const targetY = TYPE_TARGET_Y[itemType] ?? -0.5;
  const targetX = 0;    // avatar center X
  const targetZ = -4.6; // avatar center Z in world space

  const posX = targetX + cx * scale;
  const posY = targetY - cy * scale;
  const posZ = targetZ + cz * scale;

  return (
    <primitive
      object={obj}
      scale={scale}
      position={[posX, posY, posZ]}
      rotation={[0, Math.PI, 0]}
    />
  );
}
