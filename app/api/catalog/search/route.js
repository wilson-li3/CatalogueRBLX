import { searchCatalog } from "@/lib/roblox";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "All";
  const cursor = searchParams.get("cursor") || undefined;
  const sort = searchParams.get("sort") || "1"; // default: most favorited
  const limit = parseInt(searchParams.get("limit") || "30", 10);

  try {
    const result = await searchCatalog({ q, category, cursor, sort, limit });

    return Response.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    console.error("Catalog search error:", err.message);
    return Response.json(
      { items: [], nextCursor: null, hasMore: false, error: err.message },
      { status: 502 }
    );
  }
}
