import { NextResponse } from "next/server";

const ROBLOX_COOKIE = process.env.ROBLOX_COOKIE;

let cachedCsrfToken = null;

async function fetchWithCsrf(url, baseHeaders, fetchOptions) {
  // Build headers with cached CSRF token if available
  const headers1 = { ...baseHeaders };
  if (cachedCsrfToken) {
    headers1["X-CSRF-Token"] = cachedCsrfToken;
  }

  const res1 = await fetch(url, { ...fetchOptions, headers: headers1 });

  if (res1.status === 403) {
    const newToken = res1.headers.get("x-csrf-token");
    console.log("[avatar-render] Got 403, new CSRF token:", newToken ? "yes" : "no");
    if (newToken) {
      cachedCsrfToken = newToken;
      const headers2 = { ...baseHeaders, "X-CSRF-Token": newToken };
      const res2 = await fetch(url, { ...fetchOptions, headers: headers2 });
      if (res2.status === 403) {
        console.error("[avatar-render] Retry also got 403 — cookie may be expired");
      }
      return res2;
    }
  }

  // Update cached token from successful responses too
  const tokenHeader = res1.headers.get("x-csrf-token");
  if (tokenHeader) {
    cachedCsrfToken = tokenHeader;
  }

  return res1;
}

export async function POST(request) {
  try {
    const { assetIds, bodyColors, scales } = await request.json();

    if (!assetIds || !Array.isArray(assetIds) || assetIds.length === 0) {
      return NextResponse.json({ error: "No asset IDs provided" }, { status: 400 });
    }

    if (!ROBLOX_COOKIE) {
      return NextResponse.json({ error: "Server not configured (missing cookie)" }, { status: 500 });
    }

    const renderBody = {
      thumbnailConfig: {
        thumbnailId: 1,
        size: "420x420",
        thumbnailType: "2d",
      },
      avatarDefinition: {
        scales: scales || {
          head: 1,
          height: 1,
          bodyType: 0,
          width: 1,
          depth: 1,
          proportion: 0,
        },
        bodyColors: bodyColors || {
          headColor: "#d2b48c",
          rightArmColor: "#d2b48c",
          leftLegColor: "#d2b48c",
          leftArmColor: "#d2b48c",
          rightLegColor: "#d2b48c",
          torsoColor: "#d2b48c",
        },
        playerAvatarType: {
          playerAvatarType: "R15",
        },
        assets: assetIds.map((id) => ({ id: Number(id) })),
      },
    };

    const headers = {
      "Content-Type": "application/json",
      Cookie: `.ROBLOSECURITY=${ROBLOX_COOKIE}`,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0",
    };

    const renderRes = await fetchWithCsrf(
      "https://avatar.roblox.com/v1/avatar/render",
      headers,
      { method: "POST", body: JSON.stringify(renderBody) }
    );

    if (!renderRes.ok) {
      const errText = await renderRes.text();
      console.error("[avatar-render] Render request failed:", renderRes.status, errText);
      return NextResponse.json(
        { error: `Render failed: ${renderRes.status}` },
        { status: renderRes.status }
      );
    }

    let result = await renderRes.json();

    // Poll until Completed (max 15 retries, 1.5s apart)
    let retries = 0;
    while (result.state === "Pending" && retries < 15) {
      await new Promise((r) => setTimeout(r, 1500));

      const pollRes = await fetchWithCsrf(
        "https://avatar.roblox.com/v1/avatar/render",
        headers,
        { method: "POST", body: JSON.stringify(renderBody) }
      );

      if (pollRes.ok) {
        result = await pollRes.json();
      }
      retries++;
    }

    if (result.state !== "Completed") {
      return NextResponse.json(
        { error: "Render timed out", state: result.state },
        { status: 504 }
      );
    }

    return NextResponse.json({
      imageUrl: result.imageUrl,
      state: result.state,
    });
  } catch (error) {
    console.error("[avatar-render] Error:", error.message);
    return NextResponse.json(
      { error: error.message || "Render failed" },
      { status: 500 }
    );
  }
}
