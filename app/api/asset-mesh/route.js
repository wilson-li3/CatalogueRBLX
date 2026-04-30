import { RobloxFile } from "rbxm-parser";
import { parseRobloxMesh } from "@/lib/meshParser";

const ROBLOX_HEADERS = {
  "User-Agent": "Roblox/WinInet",
  Accept: "application/octet-stream",
};

function extractId(str) {
  if (!str) return null;
  const match = String(str).match(/(\d+)/);
  return match ? match[1] : null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const assetId = searchParams.get("assetId");

  if (!assetId) {
    return Response.json({ error: "No assetId provided" }, { status: 400 });
  }

  try {
    // 1. Download the RBXM model file
    const rbxmRes = await fetch(
      `https://assetdelivery.roblox.com/v1/asset/?id=${assetId}`,
      { headers: ROBLOX_HEADERS }
    );
    if (!rbxmRes.ok) {
      throw new Error(`RBXM download failed: ${rbxmRes.status}`);
    }

    const rbxmBuf = Buffer.from(await rbxmRes.arrayBuffer());

    // 2. Parse RBXM to extract mesh ID, texture ID, attachment data
    const header = rbxmBuf.toString("utf8", 0, 15);
    let rbxmData;
    if (header.includes("<roblox!")) {
      rbxmData = parseBinaryRbxm(rbxmBuf);
    } else if (header.startsWith("<roblox")) {
      rbxmData = parseXmlRbxm(rbxmBuf.toString("utf8"));
    } else {
      throw new Error("Unknown RBXM format");
    }

    if (!rbxmData.meshAssetId) {
      throw new Error("No mesh asset ID found in RBXM");
    }

    // 3. Download the raw .mesh file
    const meshRes = await fetch(
      `https://assetdelivery.roblox.com/v1/asset/?id=${rbxmData.meshAssetId}`,
      { headers: ROBLOX_HEADERS }
    );
    if (!meshRes.ok) {
      throw new Error(`Mesh download failed: ${meshRes.status}`);
    }

    const meshBuf = Buffer.from(await meshRes.arrayBuffer());

    // 4. Parse the .mesh binary into geometry arrays
    const mesh = parseRobloxMesh(meshBuf);

    // 5. Download texture as base64 (if available)
    let textureBase64 = null;
    if (rbxmData.textureAssetId) {
      try {
        const texRes = await fetch(
          `https://assetdelivery.roblox.com/v1/asset/?id=${rbxmData.textureAssetId}`,
          { headers: ROBLOX_HEADERS }
        );
        if (texRes.ok) {
          const texBuf = Buffer.from(await texRes.arrayBuffer());
          // Detect image type from magic bytes
          const mime = detectImageMime(texBuf);
          textureBase64 = `data:${mime};base64,${texBuf.toString("base64")}`;
        }
      } catch {
        // Texture failed — continue without it
      }
    }

    // 6. Diagnostic logging
    console.log(`[asset-mesh] ${assetId} | type=${rbxmData._parserType} | attach=${rbxmData.attachmentName} | scale=${JSON.stringify(rbxmData.meshScale)} | meshId=${rbxmData.meshAssetId}`);

    // 7. Return geometry + placement data
    return Response.json(
      {
        assetId,

        // Geometry (typed arrays as regular arrays for JSON)
        vertices: Array.from(mesh.vertices),
        normals: Array.from(mesh.normals),
        uvs: Array.from(mesh.uvs),
        indices: Array.from(mesh.indices),

        // Placement data from RBXM
        attachmentName: rbxmData.attachmentName,
        attachmentPosition: rbxmData.attachmentPosition,
        attachmentRotation: rbxmData.attachmentRotation,
        meshScale: rbxmData.meshScale,
        meshOffset: rbxmData.meshOffset,

        // Texture
        texture: textureBase64,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch (err) {
    console.error("Asset mesh error:", err.message);
    return Response.json(
      { error: err.message || "Failed to load asset mesh" },
      { status: 500 }
    );
  }
}

function detectImageMime(buf) {
  if (buf[0] === 0x89 && buf[1] === 0x50) return "image/png";
  if (buf[0] === 0xff && buf[1] === 0xd8) return "image/jpeg";
  return "image/png"; // fallback
}

// ── RBXM binary parsing (via rbxm-parser) ──────────────────

function parseBinaryRbxm(buf) {
  const file = RobloxFile.ReadFromBuffer(buf);
  if (!file) throw new Error("Failed to parse binary RBXM");

  const specialMesh = file.FindFirstDescendantOfClass("SpecialMesh");
  const meshPart = file.FindFirstDescendantOfClass("MeshPart");
  const attachment = file.FindFirstDescendantOfClass("Attachment");

  let meshAssetId = null;
  let textureAssetId = null;
  let meshScale = { x: 1, y: 1, z: 1 };
  let meshOffset = { x: 0, y: 0, z: 0 };

  if (specialMesh) {
    // Type A: SpecialMesh — scale applied directly
    meshAssetId = extractId(specialMesh.MeshId);
    textureAssetId = extractId(specialMesh.TextureId);
    if (specialMesh.Scale) {
      meshScale = { x: specialMesh.Scale.X, y: specialMesh.Scale.Y, z: specialMesh.Scale.Z };
    }
    if (specialMesh.Offset) {
      meshOffset = { x: specialMesh.Offset.X, y: specialMesh.Offset.Y, z: specialMesh.Offset.Z };
    }
  } else if (meshPart) {
    // Type B: MeshPart — scale = Size / InitialSize
    meshAssetId = extractId(meshPart.MeshId);
    textureAssetId = extractId(meshPart.TextureID);
    const size = meshPart.Size;
    const initSize = meshPart.InitialSize;
    if (size && initSize && initSize.X > 0 && initSize.Y > 0 && initSize.Z > 0) {
      meshScale = {
        x: size.X / initSize.X,
        y: size.Y / initSize.Y,
        z: size.Z / initSize.Z,
      };
    }
  }

  let attachmentName = "";
  let attachmentPosition = { x: 0, y: 0, z: 0 };
  let attachmentRotation = [1, 0, 0, 0, 1, 0, 0, 0, 1];

  if (attachment) {
    attachmentName = attachment.Name;
    const cf = attachment.CFrame;
    if (cf) {
      attachmentPosition = {
        x: cf.Position.X,
        y: cf.Position.Y,
        z: cf.Position.Z,
      };
      if (cf.Orientation) {
        attachmentRotation = cf.Orientation;
      }
    }
  }

  const _parserType = specialMesh ? "SpecialMesh" : meshPart ? "MeshPart" : "unknown";

  console.log(`[asset-mesh] BINARY PARSE:`, JSON.stringify({
    hasSpecialMesh: !!specialMesh,
    hasMeshPart: !!meshPart,
    specialMeshScale: specialMesh?.Scale ? { X: specialMesh.Scale.X, Y: specialMesh.Scale.Y, Z: specialMesh.Scale.Z } : null,
    meshPartSize: meshPart?.Size ? { X: meshPart.Size.X, Y: meshPart.Size.Y, Z: meshPart.Size.Z } : null,
    meshPartInitialSize: meshPart?.InitialSize ? { X: meshPart.InitialSize.X, Y: meshPart.InitialSize.Y, Z: meshPart.InitialSize.Z } : null,
    finalMeshScale: meshScale,
    parserUsed: _parserType,
  }));

  return { meshAssetId, textureAssetId, meshScale, meshOffset, attachmentName, attachmentPosition, attachmentRotation, _parserType };
}

// ── RBXM XML parsing ────────────────────────────────────────

function parseXmlRbxm(xml) {
  const attBlock = xml.match(/<Item class="Attachment"[^>]*>([\s\S]*?)<\/Item>/);

  let attachmentName = "";
  let attachmentPosition = { x: 0, y: 0, z: 0 };
  let attachmentRotation = [1, 0, 0, 0, 1, 0, 0, 0, 1];

  if (attBlock) {
    const block = attBlock[1];
    const nameMatch = block.match(/<string name="Name">([^<]+)/);
    const cfMatch = block.match(/<CoordinateFrame name="CFrame">([\s\S]*?)<\/CoordinateFrame>/);
    attachmentName = nameMatch ? nameMatch[1] : "";
    if (cfMatch) {
      const cf = cfMatch[1];
      const x = parseFloat(cf.match(/<X>([^<]+)/)?.[1] || "0");
      const y = parseFloat(cf.match(/<Y>([^<]+)/)?.[1] || "0");
      const z = parseFloat(cf.match(/<Z>([^<]+)/)?.[1] || "0");
      attachmentPosition = { x, y, z };
      attachmentRotation = [
        parseFloat(cf.match(/<R00>([^<]+)/)?.[1] || "1"),
        parseFloat(cf.match(/<R01>([^<]+)/)?.[1] || "0"),
        parseFloat(cf.match(/<R02>([^<]+)/)?.[1] || "0"),
        parseFloat(cf.match(/<R10>([^<]+)/)?.[1] || "0"),
        parseFloat(cf.match(/<R11>([^<]+)/)?.[1] || "1"),
        parseFloat(cf.match(/<R12>([^<]+)/)?.[1] || "0"),
        parseFloat(cf.match(/<R20>([^<]+)/)?.[1] || "0"),
        parseFloat(cf.match(/<R21>([^<]+)/)?.[1] || "0"),
        parseFloat(cf.match(/<R22>([^<]+)/)?.[1] || "1"),
      ];
    }
  }

  // Detect SpecialMesh vs MeshPart
  const isSpecialMesh = xml.includes('class="SpecialMesh"');
  const isMeshPart = xml.includes('class="MeshPart"');

  const meshIdMatch = xml.match(/<Content name="MeshId"><url>([^<]+)/);
  const textureIdMatch = xml.match(/<Content name="TextureId"><url>([^<]+)/)
    || xml.match(/<Content name="TextureID"><url>([^<]+)/);
  const offsetMatch = xml.match(/<Vector3 name="Offset">\s*<X>([^<]+)<\/X>\s*<Y>([^<]+)<\/Y>\s*<Z>([^<]+)/);

  const meshAssetId = extractId(meshIdMatch?.[1] || null);
  const textureAssetId = extractId(textureIdMatch?.[1] || null);
  const meshOffset = offsetMatch
    ? { x: parseFloat(offsetMatch[1]), y: parseFloat(offsetMatch[2]), z: parseFloat(offsetMatch[3]) }
    : { x: 0, y: 0, z: 0 };

  let meshScale = { x: 1, y: 1, z: 1 };

  if (isSpecialMesh) {
    // Type A: SpecialMesh — use Scale directly
    const scaleMatch = xml.match(/<Vector3 name="Scale">\s*<X>([^<]+)<\/X>\s*<Y>([^<]+)<\/Y>\s*<Z>([^<]+)/);
    if (scaleMatch) {
      meshScale = { x: parseFloat(scaleMatch[1]), y: parseFloat(scaleMatch[2]), z: parseFloat(scaleMatch[3]) };
    }
  } else if (isMeshPart) {
    // Type B: MeshPart — scale = Size / InitialSize
    const sizeMatch = xml.match(/<Vector3 name="size">\s*<X>([^<]+)<\/X>\s*<Y>([^<]+)<\/Y>\s*<Z>([^<]+)/i);
    const initSizeMatch = xml.match(/<Vector3 name="InitialSize">\s*<X>([^<]+)<\/X>\s*<Y>([^<]+)<\/Y>\s*<Z>([^<]+)/);
    if (sizeMatch && initSizeMatch) {
      const sx = parseFloat(sizeMatch[1]), sy = parseFloat(sizeMatch[2]), sz = parseFloat(sizeMatch[3]);
      const ix = parseFloat(initSizeMatch[1]), iy = parseFloat(initSizeMatch[2]), iz = parseFloat(initSizeMatch[3]);
      if (ix > 0 && iy > 0 && iz > 0) {
        meshScale = { x: sx / ix, y: sy / iy, z: sz / iz };
      }
    }
  }

  const _parserType = isSpecialMesh ? "XML-SpecialMesh" : isMeshPart ? "XML-MeshPart" : "XML-unknown";

  console.log(`[asset-mesh] XML PARSE:`, JSON.stringify({
    isSpecialMesh,
    isMeshPart,
    finalMeshScale: meshScale,
    parserUsed: _parserType,
  }));

  return { meshAssetId, textureAssetId, meshScale, meshOffset, attachmentName, attachmentPosition, attachmentRotation, _parserType };
}
