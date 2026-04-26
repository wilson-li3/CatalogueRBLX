// Server-side CDN proxy — fetches Roblox CDN content (OBJ, MTL, textures)
// and streams it to the client, bypassing CORS restrictions.

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url || !url.includes("rbxcdn.com")) {
    return new Response("Invalid URL", { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        Origin: "https://www.roblox.com",
        Referer: "https://www.roblox.com/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0",
        Accept: "*/*",
        "Accept-Encoding": "gzip, deflate, br",
      },
    });

    if (!res.ok) {
      return new Response(`CDN responded with ${res.status}`, { status: res.status });
    }

    const body = await res.arrayBuffer();

    // Determine content-type from URL extension or CDN response
    let contentType = res.headers.get("content-type") || "application/octet-stream";
    // Roblox CDN often returns text/plain for everything — detect actual type from content
    const urlPath = new URL(url).pathname;
    if (contentType === "text/plain" || contentType === "application/octet-stream") {
      // Check first bytes for PNG signature
      const bytes = new Uint8Array(body.slice(0, 8));
      const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47;
      const isJpeg = bytes[0] === 0xFF && bytes[1] === 0xD8;
      if (isPng) contentType = "image/png";
      else if (isJpeg) contentType = "image/jpeg";
      else contentType = "text/plain";
    }

    return new Response(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("CDN proxy error:", err.message);
    return new Response("Failed to fetch from CDN", { status: 502 });
  }
}
