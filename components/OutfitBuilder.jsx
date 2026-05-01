"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { styles } from "@/lib/styles";
import { useCatalogSearch } from "@/hooks/useCatalogSearch";
import { useOutfitContext } from "@/context/OutfitContext";
import Header from "./Header";
import TrendingBar from "./TrendingBar";
import SearchBar from "./SearchBar";
import CategoryTabs from "./CategoryTabs";
import ItemCard from "./ItemCard";
import Toast from "./Toast";
import { useToast } from "@/hooks/useToast";

export default function OutfitBuilder() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const { toast, showToast } = useToast();

  const { cart, addToCart, removeFromCart, isInCart, totalCartPrice } = useOutfitContext();
  const { items, loading, hasMore, loadMore } = useCatalogSearch(query, activeCategory);

  useEffect(() => {
    const q = searchParams.get("q");
    const cat = searchParams.get("category");
    if (q) setQuery(q);
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  const handleToggleCart = (item) => {
    if (isInCart(item.id)) {
      removeFromCart(item.id);
      showToast(`Removed ${item.name}`);
    } else {
      addToCart(item);
      showToast(`Added ${item.name} to cart`);
    }
  };

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
                  onAdd={handleToggleCart}
                  inOutfit={isInCart(item.id)}
                />
              </div>
            ))}
            {items.length === 0 && !loading && (
              <div style={styles.emptyState}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
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

          {hasMore && (
            <div style={{ textAlign: "center", padding: "20px 0 40px" }}>
              <button
                onClick={loadMore}
                disabled={loading}
                style={{
                  padding: "10px 28px",
                  borderRadius: 24,
                  background: "var(--surface)",
                  borderWidth: 1.5,
                  borderStyle: "solid",
                  borderColor: "var(--border)",
                  color: "var(--text-muted)",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "'Libre Franklin', sans-serif",
                  transition: "all 0.2s ease",
                }}
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>

        {/* Cart Panel */}
        <div style={cs.cartPanel}>
          <div style={cs.cartHeader}>
            <h2 style={cs.cartTitle}>Your Cart</h2>
            <span style={cs.cartCount}>{cart.length} items</span>
          </div>

          {cart.length === 0 ? (
            <div style={cs.cartEmpty}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-caption)" strokeWidth="1.5" opacity="0.3">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
              </svg>
              <p style={{ color: "var(--text-caption)", fontSize: 12, marginTop: 10, textAlign: "center", lineHeight: 1.5 }}>
                Add items from the catalog to build your outfit
              </p>
            </div>
          ) : (
            <>
              <div style={cs.cartItems}>
                {cart.map((item) => (
                  <div key={item.id} style={cs.cartItem}>
                    <div style={cs.cartItemThumb}>
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: "var(--cream-dark)" }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={cs.cartItemName}>{item.name}</div>
                      <div style={cs.cartItemType}>{item.type}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={cs.cartItemPrice}>R$ {item.price.toLocaleString()}</div>
                      <button
                        onClick={() => { removeFromCart(item.id); showToast(`Removed ${item.name}`); }}
                        style={cs.cartRemoveBtn}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={cs.cartFooter}>
                <div style={cs.cartTotal}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)" }}>Total</span>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "var(--robux)" }}>
                    R$ {totalCartPrice.toLocaleString()}
                  </span>
                </div>
                <Link href="/builder/tryon" style={cs.tryOnBtn}>
                  Try On
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 6 }}>
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      <Toast message={toast} />
    </div>
  );
}

const cs = {
  cartPanel: {
    width: 320,
    background: "var(--surface)",
    borderLeft: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  },
  cartHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 20px 16px",
    borderBottom: "1px solid var(--border)",
  },
  cartTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 18,
    fontWeight: 700,
    color: "var(--text)",
  },
  cartCount: {
    fontSize: 11,
    color: "var(--text-light)",
    background: "var(--surface-2)",
    padding: "4px 10px",
    borderRadius: 12,
    fontWeight: 600,
  },
  cartEmpty: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  cartItems: {
    flex: 1,
    overflowY: "auto",
    padding: "12px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  cartItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 14,
    background: "var(--surface-2)",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "rgba(180, 160, 140, 0.1)",
    transition: "all 0.2s ease",
  },
  cartItemThumb: {
    width: 40,
    height: 40,
    borderRadius: 10,
    overflow: "hidden",
    flexShrink: 0,
    background: "var(--surface-3)",
  },
  cartItemName: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  cartItemType: {
    fontSize: 10,
    color: "var(--text-caption)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontWeight: 500,
    marginTop: 2,
  },
  cartItemPrice: {
    fontSize: 12,
    fontWeight: 700,
    color: "var(--robux)",
    fontFamily: "'Playfair Display', serif",
  },
  cartRemoveBtn: {
    fontSize: 10,
    color: "var(--danger)",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 2,
    fontFamily: "'Libre Franklin', sans-serif",
  },
  cartFooter: {
    padding: "16px 20px",
    borderTop: "1px solid var(--border)",
    flexShrink: 0,
  },
  cartTotal: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  tryOnBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: "12px 18px",
    background: "#4a3728",
    color: "#f5efe7",
    borderRadius: 24,
    fontWeight: 700,
    fontSize: 13,
    fontFamily: "'Libre Franklin', sans-serif",
    letterSpacing: "0.03em",
    textDecoration: "none",
    transition: "all 0.3s ease",
  },
};
