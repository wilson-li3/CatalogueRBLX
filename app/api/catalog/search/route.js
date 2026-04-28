import { searchCatalog } from "@/lib/roblox";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "All";
  const cursor = searchParams.get("cursor") || undefined;

  try {
    const result = await searchCatalog({ q, category, cursor });

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
