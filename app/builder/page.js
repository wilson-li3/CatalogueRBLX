import { Suspense } from "react";
import OutfitBuilder from "@/components/OutfitBuilder";

export const metadata = {
  title: "Outfit Builder — Drip Check",
  description: "Build your perfect Roblox outfit from 98,000+ catalog items.",
};

export default function BuilderPage() {
  return (
    <Suspense>
      <OutfitBuilder />
    </Suspense>
  );
}
