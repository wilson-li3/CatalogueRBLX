import { Suspense } from "react";
import TryOnBuilder from "@/components/TryOnBuilder";

export const metadata = {
  title: "3D Try On — Drip Check",
  description: "Preview your Roblox avatar in 3D while building outfits.",
};

export default function TryOnPage() {
  return (
    <Suspense>
      <TryOnBuilder />
    </Suspense>
  );
}
