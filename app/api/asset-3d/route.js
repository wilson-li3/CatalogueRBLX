import { AvatarHelper } from "@/lib/avatar";

const avatarHelper = new AvatarHelper();

const ROBLOX_HEADERS = {
  Origin: "https://www.roblox.com",
  Referer: "https://www.roblox.com/",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0",
  "Accept-Encoding": "gzip, deflate, br",
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const assetId = searchParams.get("assetId");

  if (!assetId) {
    return Response.json({ error: "No assetId provided" }, { status: 400 });
  }

  try {
    // Use the batch thumbnail endpoint with type: "Asset", format: "Obj"
    const batchRes = await fetch("https://thumbnails.roblox.com/v1/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...ROBLOX_HEADERS },
      body: JSON.stringify([
        {
          requestId: `asset_${assetId}`,
          targetId: Number(assetId),
          type: "Asset",
          size: "420x420",
          format: "Obj",
          isCircular: false,
        },
      ]),
    });

    if (!batchRes.ok) {
      throw new Error(`Batch thumbnail failed: ${batchRes.status}`);
    }

    const batchJson = await batchRes.json();
    if (!batchJson.data || batchJson.data.length === 0) {
      throw new Error("No thumbnail data returned");
    }

    const entry = batchJson.data[0];
    if (entry.state !== "Completed" || !entry.imageUrl) {
      throw new Error(
        `Asset 3D not available (state: ${entry.state}, error: ${entry.errorMessage || "none"})`
      );
    }

    // Fetch scene metadata from the imageUrl
    const metadata = await avatarHelper.getSceneMetadata(entry.imageUrl);

    // Resolve all hashes through CDN proxy
    const proxyUrl = (cdnUrl) => `/api/cdn?url=${encodeURIComponent(cdnUrl)}`;

    return Response.json(
      {
        assetId: Number(assetId),
        camera: metadata.camera,
        aabb: metadata.aabb,
        obj: proxyUrl(avatarHelper.getHashUrl(metadata.obj)),
        mtl: proxyUrl(avatarHelper.getHashUrl(metadata.mtl)),
        textures: metadata.textures.map((hash) =>
          proxyUrl(avatarHelper.getHashUrl(hash))
        ),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      }
    );
  } catch (err) {
    console.error("Asset 3D error:", err.message);
    return Response.json(
      { error: err.message || "Failed to load asset 3D data" },
      { status: 500 }
    );
  }
}
