"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { styles } from "@/lib/styles";
import { useCatalogSearch } from "@/hooks/useCatalogSearch";
import { useOutfit } from "@/hooks/useOutfit";
import { useToast } from "@/hooks/useToast";
import Header from "./Header";
import TrendingBar from "./TrendingBar";
import SearchBar from "./SearchBar";
import CategoryTabs from "./CategoryTabs";
import ItemCard from "./ItemCard";
import OutfitPanel from "./OutfitPanel";
import ShareModal from "./ShareModal";
import Toast from "./Toast";

export default function OutfitBuilder() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Read initial query/category from URL params (from landing page links)
  useEffect(() => {
    const q = searchParams.get("q");
    const cat = searchParams.get("category");
    if (q) setQuery(q);
    if (cat) setActiveCategory(cat);
  }, [searchParams]);
  const [showShare, setShowShare] = useState(false);

  const { toast, showToast } = useToast();
  const { outfit, addToOutfit, removeFromOutfit, clearOutfit } = useOutfit(showToast);
  const { items, loading } = useCatalogSearch(query, activeCategory);

  return (
    <div style={styles.root}>
      <Header />
      <TrendingBar />

      <div style={styles.mainLayout}>
        {/* Catalog Panel */}
        <div style={styles.catalogPanel}>
          <SearchBar query={query} setQuery={setQuery} />
          <CategoryTabs active={activeCategory} setActive={setActiveCategory} />

          <div style={styles.resultsInfo}>
            <span>{loading ? "Searching..." : `${items.length} items`}</span>
            {query && (
              <span style={styles.clearSearch} onClick={() => setQuery("")}>
                Clear search
              </span>
            )}
          </div>

          <div style={styles.itemsGrid}>
            {items.map((item, idx) => (
              <div key={item.id} style={{ animation: `softReveal 0.6s cubic-bezier(0.23, 1, 0.32, 1) ${idx * 0.04}s both` }}>
                <ItemCard
                  item={item}
                  onAdd={addToOutfit}
                  inOutfit={outfit.some((i) => i.id === item.id)}
                />
              </div>
            ))}
            {items.length === 0 && !loading && (
              <div style={styles.emptyState}>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "var(--surface-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-caption)" strokeWidth="1.5" opacity="0.5">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: 14, fontWeight: 500 }}>No items found</p>
                <p style={{ color: "var(--text-caption)", fontSize: 12, marginTop: 4 }}>Try a different search term</p>
              </div>
            )}
          </div>
        </div>

        {/* Outfit Panel */}
        <OutfitPanel
          outfit={outfit}
          onRemove={removeFromOutfit}
          onClear={clearOutfit}
          onShare={() => setShowShare(true)}
        />
      </div>

      {/* Info Banner */}
      <div style={styles.infoBanner}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-warm)" strokeWidth="2" style={{ marginRight: 10, flexShrink: 0, marginTop: 1 }}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>
          <strong>Live Data:</strong> Items are fetched from Roblox&apos;s Catalog API with real thumbnails and prices. Outfit saving and 3D preview coming in v2.
        </span>
      </div>

      {showShare && <ShareModal outfit={outfit} onClose={() => setShowShare(false)} />}
      <Toast message={toast} />
    </div>
  );
}
