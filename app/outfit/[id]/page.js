import { supabase } from "@/lib/supabase";
import OutfitPermalink from "@/components/OutfitPermalink";

export async function generateMetadata({ params }) {
  const { id } = await params;

  if (!supabase) {
    return { title: "Shared Outfit — Drip Check" };
  }

  const { data } = await supabase
    .from("outfits")
    .select("items, total_price, item_count")
    .eq("slug", id)
    .single();

  if (!data) {
    return { title: "Outfit Not Found — Drip Check" };
  }

  const names = data.items.map((i) => i.name).join(", ");
  return {
    title: `Outfit (${data.item_count} items) — Drip Check`,
    description: `Check out this Roblox outfit: ${names}. Total: R$${data.total_price.toLocaleString()}`,
    openGraph: {
      title: `Roblox Outfit — R$${data.total_price.toLocaleString()}`,
      description: names,
    },
  };
}

export default async function OutfitPage({ params }) {
  const { id } = await params;

  // Try fetching from Supabase server-side
  let outfit = null;
  if (supabase) {
    const { data } = await supabase
      .from("outfits")
      .select("*")
      .eq("slug", id)
      .single();

    if (data) {
      outfit = {
        id: data.id,
        slug: data.slug,
        items: data.items,
        totalPrice: data.total_price,
        voteCount: data.vote_count,
        createdAt: data.created_at,
      };
    }
  }

  return <OutfitPermalink outfit={outfit} slug={id} />;
}
