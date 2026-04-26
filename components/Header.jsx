"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const [scrollY, setScrollY] = useState(0);
  const pathname = usePathname();
  const isLanding = pathname === "/";

  useEffect(() => {
    if (!isLanding) return;
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, [isLanding]);

  // On landing page: transparent → frosted on scroll. On other pages: always frosted.
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
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 17,
              fontWeight: 700,
              color: "#4a3728",
              letterSpacing: "-0.02em",
            }}
          >
            drip check
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          {[
            { label: "Home", href: "/" },
            { label: "Builder", href: "/builder" },
            { label: "Trending", href: "/#trending" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              style={{
                fontSize: 13,
                color: pathname === item.href ? "#4a3728" : "#8a7060",
                fontWeight: pathname === item.href ? 600 : 500,
                letterSpacing: "0.04em",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
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
    </nav>
  );
}
