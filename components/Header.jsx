"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOutfitContext } from "@/context/OutfitContext";

export default function Header() {
  const [scrollY, setScrollY] = useState(0);
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const { cart } = useOutfitContext();

  useEffect(() => {
    if (!isLanding) return;
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, [isLanding]);

  const showFrost = !isLanding || scrollY > 40;

  return (
    <nav
      style={{
        position: isLanding ? "fixed" : "sticky",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backdropFilter: "blur(16px) saturate(150%)",
        WebkitBackdropFilter: "blur(16px) saturate(150%)",
        background: showFrost ? "rgba(250, 246, 240, 0.88)" : "transparent",
        borderBottom: showFrost ? "1px solid rgba(180, 160, 140, 0.1)" : "1px solid transparent",
        transition: "all 0.5s ease",
      }}
    >
      <div
        style={{
          maxWidth: 1152,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #ddb892, #c9a690)" }} />
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: "#4a3728", letterSpacing: "-0.02em" }}>
            drip check
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          {[
            { label: "Home", href: "/" },
            { label: "Builder", href: "/builder" },
            { label: "Try On", href: "/builder/tryon" },
            { label: "Trending", href: "/#trending" },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              style={{
                fontSize: 13,
                color: pathname === link.href ? "#4a3728" : "#8a7060",
                fontWeight: pathname === link.href ? 600 : 500,
                letterSpacing: "0.04em",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right: cart badge + CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {cart.length > 0 && (
            <Link
              href="/builder/tryon"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 20,
                background: "rgba(160, 103, 75, 0.08)",
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: "rgba(160, 103, 75, 0.15)",
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a0674b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
              </svg>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#a0674b" }}>{cart.length}</span>
            </Link>
          )}
          <Link
            href="/builder"
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "8px 22px",
              borderRadius: 24,
              background: "#4a3728",
              color: "#f5efe7",
              letterSpacing: "0.05em",
              textDecoration: "none",
            }}
          >
            Start Building
          </Link>
        </div>
      </div>
    </nav>
  );
}
