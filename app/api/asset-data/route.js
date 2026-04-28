import { RobloxFile } from "rbxm-parser";

const ROBLOX_HEADERS = {
  "User-Agent": "Roblox/WinInet",
  Accept: "application/octet-stream",
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const assetId = searchParams.get("assetId");

  if (!assetId) {
    return Response.json({ error: "No assetId provided" }, { status: 400 });
  }

  try {
    // Download the model file from Roblox asset delivery
    const res = await fetch(
      `https://assetdelivery.roblox.com/v1/asset/?id=${assetId}`,
      { headers: ROBLOX_HEADERS }
    );

    if (!res.ok) {
      throw new Error(`Asset delivery failed: ${res.status}`);
    }

    const buf = Buffer.from(await res.arrayBuffer());
    const header = buf.toString("utf8", 0, 15);

    let result;
    if (header.includes("<roblox!")) {
      // Binary RBXM format — use rbxm-parser
      result = parseBinary(buf);
    } else if (header.startsWith("<roblox")) {
      // XML RBXMX format — parse manually
      result = parseXml(buf.toString("utf8"));
    } else {
      throw new Error("Unknown asset format");
    }

    return Response.json(
      { assetId: Number(assetId), ...result },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch (err) {
    console.error("Asset data error:", err.message);
    return Response.json(
      { error: err.message || "Failed to parse asset" },
      { status: 500 }
    );
  }
}

function extractId(str) {
  if (!str) return null;
  const match = str.match(/(\d+)/);
  return match ? match[1] : null;
}

// Parse binary RBXM using rbxm-parser
function parseBinary(buf) {
  const file = RobloxFile.ReadFromBuffer(buf);
  if (!file) throw new Error("Failed to parse binary RBXM");

  const attachment = file.FindFirstDescendantOfClass("Attachment");
  const specialMesh = file.FindFirstDescendantOfClass("SpecialMesh");
  const meshPart = file.FindFirstDescendantOfClass("MeshPart");

  let meshAssetId = null;
  let textureAssetId = null;
  let meshScale = { x: 1, y: 1, z: 1 };
  let meshOffset = { x: 0, y: 0, z: 0 };

  if (specialMesh) {
    meshAssetId = extractId(specialMesh.MeshId);
    textureAssetId = extractId(specialMesh.TextureId);
    meshScale = { x: specialMesh.Scale.X, y: specialMesh.Scale.Y, z: specialMesh.Scale.Z };
    meshOffset = { x: specialMesh.Offset.X, y: specialMesh.Offset.Y, z: specialMesh.Offset.Z };
  } else if (meshPart) {
    meshAssetId = extractId(meshPart.MeshId);
    textureAssetId = extractId(meshPart.TextureID);
  }

  let attachmentName = "";
  let attachmentCFrame = {
    position: { x: 0, y: 0, z: 0 },
    rotation: [1, 0, 0, 0, 1, 0, 0, 0, 1],
  };

  if (attachment) {
    attachmentName = attachment.Name;
    const cf = attachment.CFrame;
    attachmentCFrame = {
      position: { x: cf.Position.X, y: cf.Position.Y, z: cf.Position.Z },
      rotation: cf.Orientation,
    };
  }

  return { meshAssetId, textureAssetId, meshScale, meshOffset, attachmentName, attachmentCFrame };
}

// Parse XML RBXMX format
function parseXml(xml) {
  // Extract attachment — Name and CFrame can appear in either order
  const attBlock = xml.match(
    /<Item class="Attachment"[^>]*>([\s\S]*?)<\/Item>/
  );

  let attachmentName = "";
  let attachmentCFrame = {
    position: { x: 0, y: 0, z: 0 },
    rotation: [1, 0, 0, 0, 1, 0, 0, 0, 1],
  };

  if (attBlock) {
    const block = attBlock[1];
    const nameMatch = block.match(/<string name="Name">([^<]+)/);
    const cfMatch = block.match(/<CoordinateFrame name="CFrame">([\s\S]*?)<\/CoordinateFrame>/);
    attachmentName = nameMatch ? nameMatch[1] : "";
    const cf = cfMatch ? cfMatch[1] : "";
    const x = parseFloat(cf.match(/<X>([^<]+)/)?.[1] || "0");
    const y = parseFloat(cf.match(/<Y>([^<]+)/)?.[1] || "0");
    const z = parseFloat(cf.match(/<Z>([^<]+)/)?.[1] || "0");
    const r00 = parseFloat(cf.match(/<R00>([^<]+)/)?.[1] || "1");
    const r01 = parseFloat(cf.match(/<R01>([^<]+)/)?.[1] || "0");
    const r02 = parseFloat(cf.match(/<R02>([^<]+)/)?.[1] || "0");
    const r10 = parseFloat(cf.match(/<R10>([^<]+)/)?.[1] || "0");
    const r11 = parseFloat(cf.match(/<R11>([^<]+)/)?.[1] || "1");
    const r12 = parseFloat(cf.match(/<R12>([^<]+)/)?.[1] || "0");
    const r20 = parseFloat(cf.match(/<R20>([^<]+)/)?.[1] || "0");
    const r21 = parseFloat(cf.match(/<R21>([^<]+)/)?.[1] || "0");
    const r22 = parseFloat(cf.match(/<R22>([^<]+)/)?.[1] || "1");
    attachmentCFrame = {
      position: { x, y, z },
      rotation: [r00, r01, r02, r10, r11, r12, r20, r21, r22],
    };
  }

  // Extract SpecialMesh
  const meshIdMatch = xml.match(/<Content name="MeshId"><url>([^<]+)/);
  const textureIdMatch = xml.match(/<Content name="TextureId"><url>([^<]+)/);
  const scaleMatch = xml.match(
    /<Vector3 name="Scale">\s*<X>([^<]+)<\/X>\s*<Y>([^<]+)<\/Y>\s*<Z>([^<]+)/
  );
  const offsetMatch = xml.match(
    /<Vector3 name="Offset">\s*<X>([^<]+)<\/X>\s*<Y>([^<]+)<\/Y>\s*<Z>([^<]+)/
  );

  const meshAssetId = extractId(meshIdMatch?.[1] || null);
  const textureAssetId = extractId(textureIdMatch?.[1] || null);
  const meshScale = scaleMatch
    ? { x: parseFloat(scaleMatch[1]), y: parseFloat(scaleMatch[2]), z: parseFloat(scaleMatch[3]) }
    : { x: 1, y: 1, z: 1 };
  const meshOffset = offsetMatch
    ? { x: parseFloat(offsetMatch[1]), y: parseFloat(offsetMatch[2]), z: parseFloat(offsetMatch[3]) }
    : { x: 0, y: 0, z: 0 };

  return { meshAssetId, textureAssetId, meshScale, meshOffset, attachmentName, attachmentCFrame };
}
