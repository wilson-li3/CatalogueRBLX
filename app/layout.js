import "./globals.css";
import { OutfitProvider } from "@/context/OutfitContext";

export const metadata = {
  title: "Drip Check — Roblox Outfit Builder",
  description: "Build, price, and share Roblox outfits. PCPartPicker for avatars.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <OutfitProvider>{children}</OutfitProvider>
      </body>
    </html>
  );
}
