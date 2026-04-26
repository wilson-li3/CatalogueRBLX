import { supabase } from "@/lib/supabase";
import { headers } from "next/headers";
import { createHash } from "crypto";

// GET outfit by slug or UUID
export async function GET(request, { params }) {
  if (!supabase) {
    return Response.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { id } = await params;

  // Detect UUID vs slug
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const column = isUuid ? "id" : "slug";

  const { data, error } = await supabase
    .from("outfits")
    .select("*")
    .eq(column, id)
    .single();

  if (error || !data) {
    return Response.json({ error: "Outfit not found" }, { status: 404 });
  }

  return Response.json({
    id: data.id,
    slug: data.slug,
    items: data.items,
    totalPrice: data.total_price,
    itemCount: data.item_count,
    voteCount: data.vote_count,
    createdAt: data.created_at,
  });
}

// POST vote on outfit (toggle)
export async function POST(request, { params }) {
  if (!supabase) {
    return Response.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { id } = await params;
  const headersList = await headers();

  // Generate voter fingerprint from IP + User-Agent
  const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
  const ua = headersList.get("user-agent") || "unknown";
  const fingerprint = createHash("sha256").update(`${ip}:${ua}`).digest("hex").slice(0, 32);

  // Find outfit
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const column = isUuid ? "id" : "slug";

  const { data: outfit } = await supabase
    .from("outfits")
    .select("id, vote_count")
    .eq(column, id)
    .single();

  if (!outfit) {
    return Response.json({ error: "Outfit not found" }, { status: 404 });
  }

  // Check existing vote
  const { data: existingVote } = await supabase
    .from("votes")
    .select("id")
    .eq("outfit_id", outfit.id)
    .eq("voter_fingerprint", fingerprint)
    .single();

  let voted;
  let newVoteCount;

  if (existingVote) {
    // Remove vote
    await supabase.from("votes").delete().eq("id", existingVote.id);
    newVoteCount = Math.max(0, outfit.vote_count - 1);
    voted = false;
  } else {
    // Add vote
    await supabase.from("votes").insert({
      outfit_id: outfit.id,
      voter_fingerprint: fingerprint,
    });
    newVoteCount = outfit.vote_count + 1;
    voted = true;
  }

  // Update vote count
  await supabase
    .from("outfits")
    .update({ vote_count: newVoteCount, updated_at: new Date().toISOString() })
    .eq("id", outfit.id);

  return Response.json({ voteCount: newVoteCount, voted });
}
