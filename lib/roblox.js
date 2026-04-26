// Server-side Roblox API helpers with caching

// --- In-memory TTL cache ---
const cache = new Map();

function getCached(key, ttlMs) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.time < ttlMs) return entry.data;
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, time: Date.now() });
  // Evict old entries periodically
  if (cache.size > 500) {
    const now = Date.now();
    for (const [k, v] of cache) {
      if (now - v.time > 3600_000) cache.delete(k);
    }
  }
}

// --- Rate limiter (token bucket) ---
let tokens = 60;
let lastRefill = Date.now();

function acquireToken() {
  const now = Date.now();
  const elapsed = now - lastRefill;
  tokens = Math.min(60, tokens + (elapsed / 1000));
  lastRefill = now;
  if (tokens < 1) return false;
  tokens -= 1;
  return true;
}

async function robloxFetch(url) {
  if (!acquireToken()) {
    throw new Error("Rate limit reached — try again shortly");
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Roblox API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// --- Category → keyword + assetType filter ---
// Many Roblox subcategory IDs are rejected by the API, so we search by
// keyword and filter results by assetType on our side.
const CATEGORY_CONFIG = {
  Hair:  { keyword: "hair",   assetTypes: [41] },
  Hat:   { keyword: "hat",    assetTypes: [8] },
  Face:  { keyword: "face",   assetTypes: [42, 18] },
  Shirt: { keyword: "shirt",  assetTypes: [11, 64] },
  Pants: { keyword: "pants",  assetTypes: [12] },
  Shoes: { keyword: "shoes",  assetTypes: [66, 72] },
  Neck:  { keyword: "neck",   assetTypes: [43, 45] },
  Back:  { keyword: "back",   assetTypes: [46, 47, 19] },
};

// --- Catalog search ---
// sortType: 0=Relevance, 1=Favorited, 2=Sales, 3=Updated, 4=PriceAsc, 5=PriceDesc
export async function searchCatalog({ q, category, cursor, sort = "1", limit = 30 }) {
  const cacheKey = `search:${q}:${category}:${cursor || ""}:${sort}:${limit}`;
  const cached = getCached(cacheKey, 5 * 60_000); // 5 min TTL
  if (cached) return cached;

  const config = category && category !== "All" ? CATEGORY_CONFIG[category] : null;

  // Build base params (cursor changes per page, so added in the loop)
  function buildParams(pageCursor) {
    const params = new URLSearchParams();
    params.set("limit", "30");
    params.set("sortType", sort);
    params.set("minPrice", "50");
    if (pageCursor) params.set("cursor", pageCursor);

    if (q) {
      params.set("keyword", q);
    } else if (config) {
      params.set("keyword", config.keyword);
    } else {
      params.set("keyword", "accessories");
    }
    return params;
  }

  // Fetch pages until we have enough items (categories filter by assetType,
  // so a single page of 30 may yield fewer matching items). Max 3 pages.
  let collected = [];
  let nextCursor = cursor || null;
  const maxPages = config ? 3 : 1; // only multi-page for category searches

  for (let page = 0; page < maxPages; page++) {
    const params = buildParams(page === 0 ? cursor : nextCursor);
    const data = await robloxFetch(
      `https://catalog.roblox.com/v1/search/items/details?${params}`
    );

    let pageItems = (data.data || []).filter(
      (item) => item.itemType === "Asset" && item.assetType != null
    );

    if (config) {
      pageItems = pageItems.filter((item) => config.assetTypes.includes(item.assetType));
    }

    collected.push(...pageItems);
    nextCursor = data.nextPageCursor || null;

    // Stop if we have enough or no more pages
    if (collected.length >= limit || !nextCursor) break;
  }

  // Trim to requested limit
  if (limit < collected.length) collected = collected.slice(0, limit);

  const items = collected.map((item) => ({
    id: item.id,
    name: item.name,
    type: category && category !== "All" ? category : guessType(item),
    price: item.price ?? item.lowestPrice ?? 0,
    creatorName: item.creatorName || "Unknown",
    favoriteCount: item.favoriteCount || 0,
    thumbnail: null, // filled in below
  }));

  // Batch-fetch thumbnails
  if (items.length > 0) {
    const ids = items.map((i) => i.id).join(",");
    const thumbs = await fetchThumbnails(ids);
    for (const item of items) {
      const thumb = thumbs.find((t) => t.targetId === item.id);
      if (thumb && thumb.state === "Completed" && thumb.imageUrl) {
        item.thumbnail = thumb.imageUrl;
      }
    }
  }

  const result = {
    items,
    nextCursor,
    hasMore: !!nextCursor,
  };

  setCache(cacheKey, result);
  return result;
}

// Best-effort type guess when searching "All"
// Roblox assetType values: 8=Hat, 11=Shirt, 12=Pants, 18=Face, 19=Gear,
// 41=HairAccessory, 42=FaceAccessory, 43=NeckAccessory,
// 44=ShoulderAccessory, 45=FrontAccessory, 46=BackAccessory,
// 47=WaistAccessory, 64=TShirt, 65=DressSkirtAccessory
function guessType(item) {
  const t = item.assetType;
  if (t === 41) return "Hair";
  if (t === 8) return "Hat";
  if (t === 42 || t === 18) return "Face";
  if (t === 11 || t === 64) return "Shirt";
  if (t === 12) return "Pants";
  if (t === 65 || t === 66 || t === 72) return "Shoes";
  if (t === 43 || t === 45) return "Neck";
  if (t === 46 || t === 47 || t === 19) return "Back";
  return "Hat"; // fallback
}

// --- Thumbnail fetching ---
export async function fetchThumbnails(assetIds, size = "420x420") {
  const cacheKey = `thumbs:${assetIds}:${size}`;
  const cached = getCached(cacheKey, 60 * 60_000); // 1 hour TTL
  if (cached) return cached;

  const data = await robloxFetch(
    `https://thumbnails.roblox.com/v1/assets?assetIds=${assetIds}&size=${size}&format=Webp&isCircular=false`
  );

  const results = data.data || [];
  setCache(cacheKey, results);
  return results;
}
