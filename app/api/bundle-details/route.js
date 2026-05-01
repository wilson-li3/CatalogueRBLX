import { NextResponse } from "next/server";

export async function GET(request) {
  const bundleId = request.nextUrl.searchParams.get("bundleId");

  if (!bundleId) {
    return NextResponse.json({ error: "Missing bundleId parameter" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://catalog.roblox.com/v1/bundles/${bundleId}/details`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0",
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch bundle: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Extract body part asset IDs (filter for Asset type, match body part names)
    const bodyPartKeywords = ["Left Arm", "Right Arm", "Torso", "Left Leg", "Right Leg"];
    const bodyPartIds = data.items
      .filter(
        (item) =>
          item.type === "Asset" &&
          bodyPartKeywords.some((kw) => item.name.includes(kw))
      )
      .map((item) => item.id);

    return NextResponse.json({
      bundleId: Number(bundleId),
      name: data.name,
      bodyPartIds,
      allItems: data.items,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch bundle" },
      { status: 500 }
    );
  }
}
