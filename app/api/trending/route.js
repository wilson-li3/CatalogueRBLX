import { supabase } from "@/lib/supabase";

export async function GET(request) {
  if (!supabase) {
    return Response.json({ outfits: [] });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "week";
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  // Calculate time filter
  const periodMs = {
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    all: 0,
  };

  let query = supabase
    .from("outfits")
    .select("*")
    .order("vote_count", { ascending: false })
    .limit(limit);

  if (period !== "all" && periodMs[period]) {
    const since = new Date(Date.now() - periodMs[period]).toISOString();
    query = query.gte("created_at", since);
  }

  const { data, error } = await query;

  if (error) {
    return Response.json({ outfits: [], error: error.message }, { status: 500 });
  }

  return Response.json(
    {
      outfits: (data || []).map((o) => ({
        id: o.id,
        slug: o.slug,
        items: o.items,
        totalPrice: o.total_price,
        voteCount: o.vote_count,
        createdAt: o.created_at,
      })),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
