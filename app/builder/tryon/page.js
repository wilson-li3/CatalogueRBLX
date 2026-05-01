import { Suspense } from "react";
import TryOnBuilder from "@/components/TryOnBuilder";

export const metadata = {
  title: "Try On — Drip Check",
  description: "Preview your Roblox avatar with items equipped while building outfits.",
};

export default function TryOnPage() {
  return (
    <Suspense>
      <TryOnBuilder />
    </Suspense>
  );
}
