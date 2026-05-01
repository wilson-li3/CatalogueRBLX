import { NextResponse } from "next/server";

export async function GET(request) {
  const subcategory = request.nextUrl.searchParams.get("subcategory") || "Accessories";
  const limit = request.nextUrl.searchParams.get("limit") || "12";

  try {
    const res = await fetch(
      `https://catalog.roblox.com/v1/search/items/details?` +
        `category=Accessories&subcategory=${encodeURIComponent(subcategory)}&` +
        `sortType=Favorited&limit=${limit}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0",
        },
      }
    );

    if (!res.ok) {
      // Fallback: search all accessories sorted by favorited
      const fallbackRes = await fetch(
        `https://catalog.roblox.com/v1/search/items/details?` +
          `category=Accessories&sortType=Favorited&limit=${limit}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0",
          },
        }
      );

      if (!fallbackRes.ok) {
        return NextResponse.json({ data: [] }, { status: 200 });
      }

      const fallbackData = await fallbackRes.json();
      return NextResponse.json(fallbackData, {
        headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200" },
      });
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200" },
    });
  } catch (error) {
    console.error("[recommendations] Error:", error.message);
    return NextResponse.json({ data: [] }, { status: 200 });
  }
}
