"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "./Header";
import DecoShape from "./DecoShape";

const CATEGORIES = [
  { name: "Hair", apiCategory: "Hair", color: "#d4a373" },
  { name: "Hats", apiCategory: "Hat", color: "#c9a690" },
  { name: "Faces", apiCategory: "Face", color: "#ddb892" },
  { name: "Shirts", apiCategory: "Shirt", color: "#b08968" },
  { name: "Pants", apiCategory: "Pants", color: "#c4a882" },
  { name: "Shoes", apiCategory: "Shoes", color: "#d4a373" },
];

const STATS = [
  { label: "Catalog Items", value: "98K+" },
  { label: "Outfits Built", value: "2.4M" },
  { label: "Creators", value: "12K+" },
  { label: "Active Users", value: "340K" },
];

const TRENDING_TAGS = ["Fluffy Hair", "Korblox", "Headless", "Wings", "Katana"];

function formatFavorites(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

// Skeleton placeholder for loading state
function SkeletonCard({ index }) {
  return (
    <div
      style={{
        background: "#fff",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "rgba(180, 160, 140, 0.15)",
        borderRadius: 24,
        overflow: "hidden",
        animation: `softReveal 0.7s cubic-bezier(0.23, 1, 0.32, 1) ${0.08 * index}s both`,
      }}
    >
      <div style={{ width: "100%", aspectRatio: "1", background: "linear-gradient(145deg, #f5f0e8, #ede3d5)", animation: "gentlePulse 2s ease-in-out infinite" }} />
      <div style={{ padding: 20 }}>
        <div style={{ width: 48, height: 10, borderRadius: 4, background: "#f0e8dc", marginBottom: 8 }} />
        <div style={{ width: "80%", height: 16, borderRadius: 4, background: "#f0e8dc", marginBottom: 6 }} />
        <div style={{ width: "50%", height: 10, borderRadius: 4, background: "#f5f0e8", marginBottom: 16 }} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ width: 48, height: 16, borderRadius: 4, background: "#f0e8dc" }} />
          <div style={{ width: 64, height: 30, borderRadius: 24, background: "#f5f0e8" }} />
        </div>
      </div>
    </div>
  );
}

function FeaturedCard({ item, index }) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const colors = ["#d4a373", "#c9a690", "#ddb892", "#b08968", "#c4a882", "#cdb4a0", "#e6ccb2", "#b5838d"];
  const c = colors[index % 8];

  return (
    <div
      style={{
        background: "#fff",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "rgba(180, 160, 140, 0.15)",
        borderRadius: 24,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.45s cubic-bezier(0.23, 1, 0.32, 1)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 24px 48px rgba(180, 140, 100, 0.12), 0 8px 16px rgba(180, 140, 100, 0.06)"
          : "0 2px 8px rgba(180, 140, 100, 0.04)",
        animation: `softReveal 0.7s cubic-bezier(0.23, 1, 0.32, 1) ${0.08 * index}s both`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(145deg, ${c}12, ${c}08)`,
        }}
      >
        {item.thumbnail && !imgError ? (
          <img
            src={item.thumbnail}
            alt={item.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.7s ease",
              transform: hovered ? "scale(1.05)" : "scale(1)",
            }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={{ transition: "transform 0.7s ease", transform: hovered ? "scale(1.1) rotate(-8deg)" : "scale(1) rotate(0)" }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `linear-gradient(135deg, ${c}25, ${c}10)`,
                borderWidth: 1.5,
                borderStyle: "solid",
                borderColor: `${c}20`,
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${c}30` }} />
            </div>
          </div>
        )}

        {/* Favorites badge */}
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 10px",
            borderRadius: 20,
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(8px)",
          }}
        >
          <span style={{ color: "#b5838d", fontSize: 11 }}>{"\u2665"}</span>
          <span style={{ fontSize: 11, color: "#8a7060", fontWeight: 600 }}>
            {formatFavorites(item.favoriteCount || 0)}
          </span>
        </div>
      </div>

      <div style={{ padding: "16px 20px 20px" }}>
        <p style={{ fontSize: 11, color: "#b5a08a", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>
          {item.type}
        </p>
        <h3 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 17,
          fontWeight: 600,
          color: "#4a3728",
          marginBottom: 2,
          lineHeight: 1.3,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {item.name}
        </h3>
        <p style={{ fontSize: 12, color: "#b5a08a", marginBottom: 14 }}>by {item.creatorName}</p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: "#8a6542" }}>
            R$ {(item.price || 0).toLocaleString()}
          </span>
          <Link
            href={`/builder?q=${encodeURIComponent(item.name)}`}
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "7px 18px",
              borderRadius: 24,
              background: hovered ? "#4a3728" : "transparent",
              color: hovered ? "#f5efe7" : "#8a7060",
              borderWidth: 1.5,
              borderStyle: "solid",
              borderColor: hovered ? "#4a3728" : "rgba(180, 160, 140, 0.25)",
              fontFamily: "'Libre Franklin', sans-serif",
              letterSpacing: "0.03em",
              transition: "all 0.3s ease",
              textDecoration: "none",
            }}
          >
            + Add
          </Link>
        </div>
      </div>
    </div>
  );
}

function CategoryCard({ cat, index }) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <div
      style={{
        padding: 0,
        borderRadius: 16,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "hidden",
        background: hovered ? `${cat.color}0C` : "#fff",
        borderWidth: 1.5,
        borderStyle: "solid",
        borderColor: hovered ? cat.color + "30" : "rgba(180, 160, 140, 0.12)",
        transition: "all 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? "0 12px 32px rgba(180, 140, 100, 0.08)" : "none",
        animation: `softReveal 0.6s cubic-bezier(0.23, 1, 0.32, 1) ${0.06 * index}s both`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail area */}
      <div
        style={{
          width: "100%",
          aspectRatio: "1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(145deg, ${cat.color}10, ${cat.color}06)`,
          overflow: "hidden",
        }}
      >
        {cat.thumbnail && !imgError ? (
          <img
            src={cat.thumbnail}
            alt={cat.name}
            style={{
              width: "80%",
              height: "80%",
              objectFit: "contain",
              transition: "transform 0.5s ease",
              transform: hovered ? "scale(1.1)" : "scale(1)",
            }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `${cat.color}15`,
              transition: "transform 0.5s ease",
              transform: hovered ? "scale(1.12)" : "scale(1)",
            }}
          >
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${cat.color}35` }} />
          </div>
        )}
      </div>

      {/* Label */}
      <div style={{ padding: "12px 16px 16px", textAlign: "center" }}>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, color: "#4a3728", marginBottom: 2 }}>
          {cat.name}
        </p>
        <p style={{ fontSize: 11, color: "#b5a08a", fontWeight: 500 }}>
          {cat.itemCount || "Browse"}
        </p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredItems, setFeaturedItems] = useState([]);
  const [categories, setCategories] = useState(CATEGORIES.map((c) => ({ ...c, thumbnail: null, itemCount: null })));
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  // Fetch featured items (most popular across all categories)
  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch("/api/catalog/search?sort=1&limit=8");
        if (res.ok) {
          const data = await res.json();
          if (data.items.length > 0) setFeaturedItems(data.items);
        }
      } catch {
        // leave empty, will show skeletons then nothing
      } finally {
        setLoadingFeatured(false);
      }
    }
    fetchFeatured();
  }, []);

  // Fetch one top item per category for thumbnail + count
  useEffect(() => {
    CATEGORIES.forEach(async (cat, idx) => {
      try {
        const res = await fetch(`/api/catalog/search?category=${cat.apiCategory}&sort=1&limit=10`);
        if (!res.ok) return;
        const data = await res.json();
        const topItem = data.items.find((i) => i.thumbnail) || data.items[0];
        setCategories((prev) => {
          const next = [...prev];
          next[idx] = {
            ...next[idx],
            thumbnail: topItem?.thumbnail || null,
            itemCount: data.items.length > 0 ? `${data.items.length}+ items` : "Browse",
          };
          return next;
        });
      } catch {
        // keep placeholder
      }
    });
  }, []);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", fontFamily: "'Libre Franklin', sans-serif", color: "var(--text)", overflowX: "hidden" }}>

      <Header />

      {/* ===== HERO ===== */}
      <section style={{ position: "relative", paddingTop: 160, paddingBottom: 112, overflow: "hidden" }}>
        <DecoShape type="blob1" color="#ddb89225" style={{ position: "absolute", top: "-5%", right: "-8%", width: 450, height: 450, animation: "floatGentle 14s ease-in-out infinite" }} />
        <DecoShape type="blob2" color="#c9a69018" style={{ position: "absolute", bottom: "-15%", left: "-10%", width: 500, height: 500, animation: "floatSlow 18s ease-in-out infinite" }} />
        <DecoShape type="ring" color="#d4a373" style={{ position: "absolute", top: "15%", right: "18%", width: 80, height: 80, animation: "floatGentle 10s ease-in-out infinite", opacity: 0.3 }} />
        <DecoShape type="scribble" color="#b5838d" style={{ position: "absolute", bottom: "20%", right: "8%", width: 90, height: 90, animation: "floatSlow 12s ease-in-out infinite" }} />
        <DecoShape type="dots" color="#c9a690" style={{ position: "absolute", top: "30%", left: "5%", width: 100, height: 100, animation: "floatGentle 16s ease-in-out infinite" }} />
        <DecoShape type="leaf" color="#8a7060" style={{ position: "absolute", top: "10%", left: "12%", width: 45, height: 75, animation: "floatSlow 11s ease-in-out infinite", transform: "rotate(-20deg)" }} />

        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 10, textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 32, animation: "softReveal 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.1s both" }}>
            <div style={{ height: 1, width: 32, background: "#c9a690", opacity: 0.5 }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#b5a08a" }}>
              Roblox Outfit Builder
            </span>
            <div style={{ height: 1, width: 32, background: "#c9a690", opacity: 0.5 }} />
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontSize: 68, fontWeight: 700, lineHeight: 1.05,
            color: "#4a3728", letterSpacing: "-0.025em", marginBottom: 24,
            animation: "softReveal 0.9s cubic-bezier(0.23, 1, 0.32, 1) 0.2s both",
          }}>
            Curate your<br />
            <span style={{ fontStyle: "italic", color: "#a0674b" }}>perfect look.</span>
          </h1>

          <p style={{
            fontSize: 16, color: "#a09080", lineHeight: 1.7, fontWeight: 400, maxWidth: 440,
            margin: "0 auto 40px", animation: "softReveal 0.9s cubic-bezier(0.23, 1, 0.32, 1) 0.35s both",
          }}>
            Browse 98,000+ catalog items. Build outfits, share your style,
            and discover what&apos;s trending — all from your browser.
          </p>

          {/* Search */}
          <div style={{
            maxWidth: 512, margin: "0 auto", position: "relative", borderRadius: 9999, background: "#fff",
            borderWidth: 1.5, borderStyle: "solid", borderColor: "rgba(180, 160, 140, 0.15)",
            boxShadow: "0 4px 24px rgba(180, 140, 100, 0.06)",
            animation: "softReveal 0.9s cubic-bezier(0.23, 1, 0.32, 1) 0.5s both",
          }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <svg style={{ marginLeft: 20, flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c4b5a2" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items, styles, creators..."
                style={{ flex: 1, background: "transparent", border: "none", fontSize: 14, color: "#4a3728", padding: "15px 12px", fontFamily: "'Libre Franklin', sans-serif", fontWeight: 400 }}
                onKeyDown={(e) => { if (e.key === "Enter" && searchQuery.trim()) window.location.href = `/builder?q=${encodeURIComponent(searchQuery.trim())}`; }}
              />
              <Link
                href={searchQuery.trim() ? `/builder?q=${encodeURIComponent(searchQuery.trim())}` : "/builder"}
                style={{ marginRight: 6, fontSize: 13, fontWeight: 600, padding: "10px 24px", borderRadius: 24, background: "#4a3728", color: "#f5efe7", letterSpacing: "0.03em", fontFamily: "'Libre Franklin', sans-serif", textDecoration: "none" }}
              >
                Search
              </Link>
            </div>
          </div>

          {/* Tags */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 24, animation: "softReveal 0.9s cubic-bezier(0.23, 1, 0.32, 1) 0.65s both" }}>
            {TRENDING_TAGS.map((tag) => (
              <Link key={tag} href={`/builder?q=${encodeURIComponent(tag)}`} style={{
                fontSize: 12, color: "#a09080", padding: "6px 14px", borderRadius: 20, background: "rgba(255,255,255,0.6)",
                borderWidth: 1, borderStyle: "solid", borderColor: "rgba(180, 160, 140, 0.12)", fontWeight: 500, textDecoration: "none", transition: "all 0.2s ease",
              }}>
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section style={{ borderTop: "1px solid rgba(180, 160, 140, 0.1)", borderBottom: "1px solid rgba(180, 160, 140, 0.1)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, textAlign: "center" }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{ animation: `softReveal 0.6s ease ${0.08 * i}s both` }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: "#4a3728", marginBottom: 2 }}>{s.value}</p>
              <p style={{ fontSize: 12, color: "#b5a08a", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section style={{ padding: "80px 0 112px" }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#b5a08a", marginBottom: 12 }}>Browse</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: "#4a3728", letterSpacing: "-0.015em" }}>Shop by Category</h2>
            <div style={{ width: 48, height: 2, background: "#d4a373", margin: "16px auto 0", borderRadius: 1, opacity: 0.5 }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
            {categories.map((cat, i) => (
              <Link key={cat.name} href={`/builder?category=${cat.apiCategory}`} style={{ textDecoration: "none" }}>
                <CategoryCard cat={cat} index={i} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED ===== */}
      <section id="trending" style={{ paddingBottom: 112 }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 56, flexWrap: "wrap", gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#b5a08a", marginBottom: 12 }}>Trending</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: "#4a3728", letterSpacing: "-0.015em" }}>Most Popular</h2>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {loadingFeatured
              ? Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} index={i} />)
              : featuredItems.map((item, i) => <FeaturedCard key={item.id} item={item} index={i} />)
            }
          </div>

          <div style={{ textAlign: "center", marginTop: 56 }}>
            <Link href="/builder" style={{
              display: "inline-block", fontSize: 13, fontWeight: 600, padding: "12px 36px", borderRadius: 28,
              background: "transparent", color: "#8a7060", borderWidth: 1.5, borderStyle: "solid",
              borderColor: "rgba(180, 160, 140, 0.2)", fontFamily: "'Libre Franklin', sans-serif",
              letterSpacing: "0.04em", textDecoration: "none", transition: "all 0.3s ease",
            }}>
              View all items
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section style={{ padding: "80px 0 112px", position: "relative", overflow: "hidden" }}>
        <DecoShape type="blob1" color="#ddb89215" style={{ position: "absolute", top: "-20%", left: "-10%", width: 400, height: 400 }} />
        <DecoShape type="ring" color="#c9a690" style={{ position: "absolute", bottom: "10%", right: "8%", width: 100, height: 100, opacity: 0.2 }} />

        <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px", textAlign: "center", position: "relative", zIndex: 10 }}>
          <div style={{
            borderRadius: 24, padding: "64px 48px", position: "relative", overflow: "hidden",
            background: "linear-gradient(145deg, #f0e8dc, #ede3d5)", borderWidth: 1, borderStyle: "solid", borderColor: "rgba(180, 160, 140, 0.12)",
          }}>
            <div style={{ position: "absolute", top: 24, left: 32, width: 48, height: 48, borderRadius: "50%", background: "#d4a37318" }} />
            <div style={{ position: "absolute", bottom: 32, right: 40, width: 32, height: 32, borderRadius: "50%", background: "#c9a69015" }} />
            <div style={{ position: "absolute", top: 40, right: 64, width: 20, height: 20, borderRadius: "50%", background: "#b5838d12" }} />

            <h2 style={{
              position: "relative", zIndex: 10, fontFamily: "'Playfair Display', serif", fontSize: 34,
              fontWeight: 700, color: "#4a3728", lineHeight: 1.15, letterSpacing: "-0.015em", marginBottom: 16,
            }}>
              Ready to build<br />
              <span style={{ fontStyle: "italic", color: "#a0674b" }}>your outfit?</span>
            </h2>
            <p style={{ fontSize: 14, color: "#a09080", lineHeight: 1.7, maxWidth: 360, margin: "0 auto 28px", position: "relative", zIndex: 10 }}>
              Join thousands creating and sharing looks. Free, browser-based, no download needed.
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, position: "relative", zIndex: 10, flexWrap: "wrap" }}>
              <Link href="/builder" style={{
                fontSize: 13, fontWeight: 700, padding: "13px 32px", borderRadius: 28, background: "#4a3728",
                color: "#f5efe7", letterSpacing: "0.04em", fontFamily: "'Libre Franklin', sans-serif", textDecoration: "none",
              }}>
                Open Outfit Builder
              </Link>
              <Link href="/builder" style={{
                fontSize: 13, fontWeight: 600, padding: "13px 32px", borderRadius: 28, background: "rgba(255,255,255,0.6)",
                color: "#8a7060", borderWidth: 1.5, borderStyle: "solid", borderColor: "rgba(180, 160, 140, 0.15)",
                letterSpacing: "0.04em", fontFamily: "'Libre Franklin', sans-serif", textDecoration: "none",
              }}>
                Browse Catalogue
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ borderTop: "1px solid rgba(180, 160, 140, 0.1)" }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "56px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 48 }}>
            <div style={{ maxWidth: 280 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #ddb892, #c9a690)" }} />
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: "#4a3728" }}>drip check</span>
              </div>
              <p style={{ fontSize: 13, color: "#b5a08a", lineHeight: 1.7 }}>
                The open outfit builder for Roblox players. Not affiliated with Roblox Corporation.
              </p>
            </div>
            <div style={{ display: "flex", gap: 64 }}>
              {[
                { title: "Product", links: [{ label: "Catalogue", href: "/builder" }, { label: "Builder", href: "/builder" }, { label: "Trending", href: "#trending" }] },
                { title: "Community", links: [{ label: "Discord", href: "#" }, { label: "Twitter", href: "#" }] },
                { title: "Legal", links: [{ label: "Terms", href: "#" }, { label: "Privacy", href: "#" }] },
              ].map((col) => (
                <div key={col.title}>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#b5a08a", marginBottom: 14 }}>{col.title}</p>
                  <ul style={{ listStyle: "none" }}>
                    {col.links.map((link) => (
                      <li key={link.label} style={{ marginBottom: 10 }}>
                        <Link href={link.href} style={{ fontSize: 13, color: "#a09080", textDecoration: "none" }}>{link.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 56, paddingTop: 24, borderTop: "1px solid rgba(180, 160, 140, 0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <p style={{ fontSize: 12, color: "#c4b5a2" }}>&copy; 2026 Drip Check. All rights reserved.</p>
            <p style={{ fontSize: 12, color: "#c4b5a2" }}>Crafted with care for the Roblox community</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
