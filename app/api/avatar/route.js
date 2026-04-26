import { AvatarHelper } from "@/lib/avatar";

const avatarHelper = new AvatarHelper();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return Response.json({ error: "No username provided" }, { status: 400 });
  }

  try {
    const avatarData = await avatarHelper.loadAvatar(username);

    return Response.json(avatarData, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    console.error("Avatar load error:", err.message);

    const status = err.message?.includes("not found") ? 404 : 500;
    return Response.json(
      { error: err.message || "Failed to load avatar" },
      { status }
    );
  }
}
