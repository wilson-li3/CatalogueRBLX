import { Suspense } from "react";
import SharedOutfitView from "@/components/SharedOutfitView";

export const metadata = {
  title: "Shared Outfit — Drip Check",
  description: "Check out this Roblox outfit on Drip Check.",
};

export default function SharedOutfitPage() {
  return (
    <Suspense>
      <SharedOutfitView />
    </Suspense>
  );
}
