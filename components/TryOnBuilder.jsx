"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useCatalogSearch } from "@/hooks/useCatalogSearch";
import { useOutfit } from "@/hooks/useOutfit";
import { useToast } from "@/hooks/useToast";
import Header from "./Header";
import SearchBar from "./SearchBar";
import CategoryTabs from "./CategoryTabs";
import ItemCard from "./ItemCard";
import Toast from "./Toast";

// Dynamic import — Three.js cannot SSR
const AvatarViewer = dynamic(() => import("@/components/AvatarViewer"), {
  ssr: false,
  loading: () => (
    <div style={{
      width: "100%", height: "100%", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "var(--cream-dark)", color: "var(--text-muted)", fontSize: 13,
    }}>
      Loading 3D viewer...
    </div>
  ),
});

export default function TryOnBuilder() {
  const searchParams = useSearchParams();
  const [usernameInput, setUsernameInput] = useState("Roblox");
  const [username, setUsername] = useState("Roblox");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const { toast, showToast } = useToast();
  const { outfit, addToOutfit, removeFromOutfit, clearOutfit } = useOutfit(showToast);
  const { items, loading } = useCatalogSearch(query, activeCategory);

  useEffect(() => {
    const q = searchParams.get("q");
    const cat = searchParams.get("category");
    if (q) setQuery(q);
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  const handleLoadAvatar = (e) => {
    e.preventDefault();
    if (usernameInput.trim()) {
      setUsername(usernameInput.trim());
    }
  };

  const totalPrice = outfit.reduce((sum, i) => sum + i.price, 0);

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", color: "var(--text)", background: "var(--bg)", minHeight: "100vh" }}>
      <Header />

      <div style={s.splitLayout}>
        {/* ===== Left: 3D Viewport ===== */}
        <div style={s.viewportPanel}>
          <AvatarViewer username={username} outfit={outfit} onRemoveItem={removeFromOutfit} />
        </div>

        {/* ===== Right: Sidebar ===== */}
        <div style={s.sidebar}>
          {/* Username Input */}
          <div style={s.sidebarSection}>
            <label style={s.sectionLabel}>Roblox Username</label>
            <form onSubmit={handleLoadAvatar} style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Enter username..."
                style={s.usernameInput}
              />
              <button type="submit" style={s.loadBtn}>Load</button>
            </form>
          </div>

          {/* Search + Categories */}
          <div style={s.sidebarSection}>
            <SearchBar query={query} setQuery={setQuery} />
            <div style={{ marginTop: 12 }}>
              <CategoryTabs active={activeCategory} setActive={setActiveCategory} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, fontSize: 12, color: "var(--text-muted)" }}>
              <span>{loading ? "Searching..." : `${items.length} items`}</span>
              {query && (
                <span style={{ cursor: "pointer", color: "var(--accent-warm)", fontWeight: 600 }} onClick={() => setQuery("")}>
                  Clear
                </span>
              )}
            </div>
          </div>

          {/* Item Grid */}
          <div style={s.itemGrid}>
            {items.map((item, idx) => (
              <div key={item.id} style={{ animation: `softReveal 0.5s cubic-bezier(0.23, 1, 0.32, 1) ${idx * 0.03}s both` }}>
                <ItemCard
                  item={item}
                  onAdd={addToOutfit}
                  inOutfit={outfit.some((i) => i.id === item.id)}
                />
              </div>
            ))}
            {items.length === 0 && !loading && (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 0" }}>
                <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No items found</p>
              </div>
            )}
          </div>

          {/* Outfit Summary */}
          {outfit.length > 0 && (
            <div style={s.outfitSummary}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-light)" }}>
                  Your Outfit ({outfit.length})
                </span>
                <button onClick={clearOutfit} style={s.clearBtn}>Clear</button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                {outfit.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => removeFromOutfit(item.id)}
                    style={s.outfitChip}
                    title={`Remove ${item.name}`}
                  >
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt="" style={{ width: 24, height: 24, borderRadius: 6, objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--blush)", opacity: 0.3 }} />
                    )}
                    <span style={{ fontSize: 11, color: "var(--text)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 80 }}>
                      {item.name}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--text-caption)", marginLeft: "auto" }}>{"\u2715"}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>Total</span>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "var(--robux)" }}>
                  R$ {totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <Toast message={toast} />
    </div>
  );
}

// ---- Inline styles ----
const s = {
  splitLayout: {
    display: "flex",
    height: "calc(100vh - 64px)",
  },
  viewportPanel: {
    flex: 1,
    position: "relative",
    background: "var(--cream-dark)",
    minWidth: 0,
  },
  sidebar: {
    width: 420,
    display: "flex",
    flexDirection: "column",
    borderLeft: "1px solid var(--border)",
    background: "var(--surface)",
    overflowY: "auto",
    flexShrink: 0,
  },
  sidebarSection: {
    padding: "20px 20px 0",
  },
  sectionLabel: {
    display: "block",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "var(--text-caption)",
    marginBottom: 10,
  },
  usernameInput: {
    flex: 1,
    padding: "10px 14px",
    background: "var(--surface-2)",
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "var(--border)",
    fontSize: 13,
    color: "var(--text)",
    fontFamily: "'Libre Franklin', sans-serif",
    outline: "none",
  },
  loadBtn: {
    padding: "10px 20px",
    background: "var(--accent)",
    color: "#f5efe7",
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.04em",
    fontFamily: "'Libre Franklin', sans-serif",
    cursor: "pointer",
    border: "none",
  },
  itemGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 10,
    padding: "16px 20px",
    flex: 1,
    alignContent: "start",
  },
  outfitSummary: {
    padding: "16px 20px",
    borderTop: "1px solid var(--border)",
    background: "var(--surface-2)",
    flexShrink: 0,
  },
  clearBtn: {
    fontSize: 11,
    color: "var(--danger)",
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    background: "none",
    fontFamily: "'Libre Franklin', sans-serif",
  },
  outfitChip: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 8px",
    borderRadius: 10,
    background: "var(--surface)",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "var(--border)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
};
