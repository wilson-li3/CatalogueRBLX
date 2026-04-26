import "./globals.css";

export const metadata = {
  title: "Drip Check — Roblox Outfit Builder",
  description: "Build, price, and share Roblox outfits. PCPartPicker for avatars.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
