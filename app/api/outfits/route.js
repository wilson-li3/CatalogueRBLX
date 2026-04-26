import { supabase } from "@/lib/supabase";
import { nanoid } from "nanoid";

export async function POST(request) {
  if (!supabase) {
    return Response.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const body = await request.json();
  const { items } = body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return Response.json({ error: "items array required" }, { status: 400 });
  }

  // Generate unique slug with collision retry
  let slug;
  for (let i = 0; i < 5; i++) {
    slug = nanoid(8);
    const { data: existing } = await supabase
      .from("outfits")
      .select("id")
      .eq("slug", slug)
      .single();
    if (!existing) break;
  }

  const totalPrice = items.reduce((sum, i) => sum + (i.price || 0), 0);

  const { data, error } = await supabase
    .from("outfits")
    .insert({
      slug,
      items,
      total_price: totalPrice,
      item_count: items.length,
      vote_count: 0,
    })
    .select()
    .single();

  if (error) {
    console.error("Outfit save error:", error);
    return Response.json({ error: "Failed to save outfit" }, { status: 500 });
  }

  return Response.json({
    id: data.id,
    slug: data.slug,
    items: data.items,
    totalPrice: data.total_price,
    voteCount: data.vote_count,
    createdAt: data.created_at,
  });
}

export async function GET(request) {
  if (!supabase) {
    return Response.json({ outfits: [] }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const sort = searchParams.get("sort") || "recent";

  let query = supabase
    .from("outfits")
    .select("*")
    .limit(limit);

  if (sort === "popular") {
    query = query.order("vote_count", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    return Response.json({ outfits: [], error: error.message }, { status: 500 });
  }

  return Response.json({
    outfits: data.map((o) => ({
      id: o.id,
      slug: o.slug,
      items: o.items,
      totalPrice: o.total_price,
      itemCount: o.item_count,
      voteCount: o.vote_count,
      createdAt: o.created_at,
    })),
  });
}
