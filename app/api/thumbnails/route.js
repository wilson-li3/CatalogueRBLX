import { fetchThumbnails } from "@/lib/roblox";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids") || "";
  const size = searchParams.get("size") || "420x420";

  if (!ids) {
    return Response.json({ data: [], error: "ids parameter required" }, { status: 400 });
  }

  try {
    const data = await fetchThumbnails(ids, size);

    return Response.json({ data }, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error("Thumbnail fetch error:", err.message);
    return Response.json({ data: [], error: err.message }, { status: 502 });
  }
}
