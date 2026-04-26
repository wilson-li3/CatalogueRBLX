"use client";

import { useState } from "react";
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
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
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
              <div key={item.id} style={{ animation: `fadeInUp 0.3s ease ${idx * 0.04}s both` }}>
                <ItemCard
                  item={item}
                  onAdd={addToOutfit}
                  inOutfit={outfit.some((i) => i.id === item.id)}
                />
              </div>
            ))}
            {items.length === 0 && !loading && (
              <div style={styles.emptyState}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" opacity="0.3">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <p style={{ color: "var(--text-muted)", marginTop: 12 }}>No items found</p>
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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" style={{ marginRight: 8, flexShrink: 0 }}>
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
