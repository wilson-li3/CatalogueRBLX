// Server-side Roblox 3D Avatar API client
// Converted from reference project's avatar.ts — uses fetch instead of axios,
// and the batch thumbnail endpoint instead of the now-403 avatar-3d endpoint.

const ROBLOX_HEADERS = {
  Origin: "https://www.roblox.com",
  Referer: "https://www.roblox.com/",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0",
  "Accept-Encoding": "gzip, deflate, br",
};

export class AvatarHelper {
  /**
   * Roblox distributes CDN files across 8 servers (t0-t7.rbxcdn.com).
   * The server is determined by XOR-ing through the hash characters.
   */
  getHashUrl(hash) {
    let st = 31;
    for (let i = 0; i < hash.length; i++) {
      st ^= hash.charCodeAt(i);
    }
    return `https://t${(st % 8).toString()}.rbxcdn.com/${hash}`;
  }

  /**
   * Convert a Roblox username to a user ID.
   */
  async getUserId(username) {
    const res = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...ROBLOX_HEADERS },
      body: JSON.stringify({ usernames: [username] }),
    });

    if (!res.ok) {
      throw new Error(`Roblox user lookup failed: ${res.status}`);
    }

    const data = await res.json();
    if (!data.data || data.data.length === 0) {
      throw new Error(`User "${username}" not found`);
    }

    return data.data[0].id;
  }

  /**
   * Get the 3D avatar data via the batch thumbnail endpoint.
   * Returns { state, imageUrl } — imageUrl points to scene metadata JSON.
   */
  async getAvatarThumbnail(userId) {
    const res = await fetch("https://thumbnails.roblox.com/v1/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...ROBLOX_HEADERS },
      body: JSON.stringify([
        {
          requestId: `avatar_${userId}`,
          targetId: userId,
          type: "Avatar",
          size: "420x420",
          format: "Obj",
          isCircular: false,
        },
      ]),
    });

    if (!res.ok) {
      throw new Error(`Roblox batch thumbnail failed: ${res.status}`);
    }

    const json = await res.json();
    if (!json.data || json.data.length === 0) {
      throw new Error("No thumbnail data returned");
    }

    return json.data[0];
  }

  /**
   * Fetch scene metadata (OBJ/MTL hashes, camera, textures)
   * from the imageUrl returned by getAvatarThumbnail.
   */
  async getSceneMetadata(imageUrl) {
    const res = await fetch(imageUrl, {
      headers: { ...ROBLOX_HEADERS, Accept: "application/json" },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch scene metadata: ${res.status}`);
    }

    return res.json();
  }

  /**
   * Full pipeline: username → scene metadata with resolved CDN URLs.
   * Returns { userId, camera, aabb, obj, mtl, textures }.
   */
  async loadAvatar(username) {
    const userId = await this.getUserId(username);
    const thumbnail = await this.getAvatarThumbnail(userId);

    if (thumbnail.state !== "Completed") {
      throw new Error(
        `Avatar thumbnail is not ready (state: ${thumbnail.state})`
      );
    }

    const metadata = await this.getSceneMetadata(thumbnail.imageUrl);

    // Proxy all CDN URLs through /api/cdn to avoid CORS issues.
    // The OBJ/MTL loaders fetch these client-side.
    const proxyUrl = (cdnUrl) => `/api/cdn?url=${encodeURIComponent(cdnUrl)}`;

    return {
      userId,
      camera: metadata.camera,
      aabb: metadata.aabb,
      obj: proxyUrl(this.getHashUrl(metadata.obj)),
      mtl: proxyUrl(this.getHashUrl(metadata.mtl)),
      textures: metadata.textures.map((hash) => proxyUrl(this.getHashUrl(hash))),
    };
  }
}
