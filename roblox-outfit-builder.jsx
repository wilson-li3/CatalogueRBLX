import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// ROBLOX OUTFIT BUILDER MVP — "DRIP CHECK"
// ============================================================
// A web-based Roblox outfit builder where users can search
// catalog items, build outfits, calculate total cost, and
// share outfit links. Uses Roblox's public API endpoints
// (in production, proxied through your backend).
// ============================================================

// --- Mock Data (Replace with real Roblox API calls via your proxy) ---
const MOCK_ITEMS = [
  { id: 607702162, name: "Midnight Blue Shaggy", type: "Hair", price: 80, creatorName: "Roblox", thumbnail: "https://tr.rbxcdn.com/180DAY-4e1895c422990e04b8edbdd1bf1bfbeb/420/420/Hat/Webp/noFilter" },
  { id: 4819740796, name: "Black Fluffy Hair", type: "Hair", price: 80, creatorName: "UGC Creator", thumbnail: "https://tr.rbxcdn.com/180DAY-c91c06833afe0e9b79e0724f0dc5b4c5/420/420/Hat/Webp/noFilter" },
  { id: 48474313, name: "Red Clockwork Shades", type: "Face", price: 50, creatorName: "Roblox", thumbnail: "https://tr.rbxcdn.com/180DAY-b23ae6da41e38a1fc5eb186e40881153/420/420/Hat/Webp/noFilter" },
  { id: 10726856854, name: "Aesthetic Headphones", type: "Hat", price: 75, creatorName: "UGC Creator", thumbnail: "https://tr.rbxcdn.com/180DAY-be9b26e4fed7f58e2b22d3d9e0e5e98d/420/420/Hat/Webp/noFilter" },
  { id: 6969756195, name: "Black Tactical Vest", type: "Shirt", price: 5, creatorName: "UGC Creator", thumbnail: "https://tr.rbxcdn.com/180DAY-c7f2c7f9aaf3b61e6c2c6a2f9ec0d0d3/420/420/Shirt/Webp/noFilter" },
  { id: 5765425792, name: "Camo Cargo Pants", type: "Pants", price: 5, creatorName: "UGC Creator", thumbnail: "https://tr.rbxcdn.com/180DAY-5a72e6c5b87f3e9b89c0c8c5c3a2e1d4/420/420/Pants/Webp/noFilter" },
  { id: 11736165846, name: "White Nike Dunks", type: "Shoes", price: 50, creatorName: "UGC Creator", thumbnail: "https://tr.rbxcdn.com/180DAY-3d7e9f8c2a1b4e6d5c8f7a0b9e3d2c1f/420/420/Hat/Webp/noFilter" },
  { id: 12345678901, name: "Gold Chain", type: "Neck", price: 100, creatorName: "UGC Creator", thumbnail: "https://tr.rbxcdn.com/180DAY-1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d/420/420/Hat/Webp/noFilter" },
  { id: 12345678902, name: "Demon Horns", type: "Hat", price: 150, creatorName: "UGC Creator", thumbnail: "https://tr.rbxcdn.com/180DAY-7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c/420/420/Hat/Webp/noFilter" },
  { id: 12345678903, name: "Anime Sword", type: "Back", price: 200, creatorName: "UGC Creator", thumbnail: "https://tr.rbxcdn.com/180DAY-0f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c/420/420/Hat/Webp/noFilter" },
  { id: 12345678904, name: "Neon Wings", type: "Back", price: 350, creatorName: "UGC Creator", thumbnail: "https://tr.rbxcdn.com/180DAY-a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5/420/420/Hat/Webp/noFilter" },
  { id: 12345678905, name: "Sus Mask", type: "Face", price: 25, creatorName: "UGC Creator", thumbnail: "https://tr.rbxcdn.com/180DAY-f0e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5/420/420/Hat/Webp/noFilter" },
];

const CATEGORIES = ["All", "Hair", "Hat", "Face", "Shirt", "Pants", "Shoes", "Neck", "Back"];

// --- Utility: generate share link ---
function generateShareCode(outfit) {
  const ids = outfit.map((i) => i.id).join("-");
  return `drip.gg/outfit/${btoa(ids).slice(0, 12)}`;
}

// --- Components ---

function SearchBar({ query, setQuery }) {
  return (
    <div style={styles.searchWrapper}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        placeholder="Search items... (e.g. hair, wings, sword)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={styles.searchInput}
      />
    </div>
  );
}

function CategoryTabs({ active, setActive }) {
  return (
    <div style={styles.tabsRow}>
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => setActive(cat)}
          style={{
            ...styles.tab,
            ...(active === cat ? styles.tabActive : {}),
          }}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

function ItemCard({ item, onAdd, inOutfit }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        ...styles.itemCard,
        ...(hovered ? styles.itemCardHover : {}),
        ...(inOutfit ? styles.itemCardSelected : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onAdd(item)}
    >
      <div style={styles.itemImageWrap}>
        <div style={styles.itemImagePlaceholder}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" opacity="0.4">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
        {inOutfit && (
          <div style={styles.checkBadge}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        )}
      </div>
      <div style={styles.itemInfo}>
        <div style={styles.itemName}>{item.name}</div>
        <div style={styles.itemMeta}>
          <span style={styles.itemType}>{item.type}</span>
          <span style={styles.itemPrice}>
            <span style={styles.robuxIcon}>R$</span> {item.price.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

function OutfitSlot({ item, onRemove, label }) {
  const [hovered, setHovered] = useState(false);
  if (!item) {
    return (
      <div style={styles.outfitSlotEmpty}>
        <div style={styles.slotLabel}>{label}</div>
        <div style={styles.slotPlaceholder}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" opacity="0.3">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
      </div>
    );
  }
  return (
    <div
      style={{
        ...styles.outfitSlotFilled,
        ...(hovered ? { borderColor: "var(--danger)" } : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onRemove(item.id)}
    >
      <div style={styles.slotLabel}>{label}</div>
      <div style={styles.slotItemThumb}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
      <div style={styles.slotItemName}>{item.name}</div>
      {hovered && (
        <div style={styles.removeX}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="3" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
      )}
    </div>
  );
}

function OutfitPanel({ outfit, onRemove, onClear, onShare }) {
  const totalPrice = outfit.reduce((sum, i) => sum + i.price, 0);
  const slotTypes = ["Hair", "Hat", "Face", "Shirt", "Pants", "Shoes", "Neck", "Back"];

  return (
    <div style={styles.outfitPanel}>
      <div style={styles.outfitHeader}>
        <h2 style={styles.outfitTitle}>Your Outfit</h2>
        <span style={styles.itemCount}>{outfit.length} items</span>
      </div>

      <div style={styles.slotsGrid}>
        {slotTypes.map((type) => {
          const item = outfit.find((i) => i.type === type);
          return <OutfitSlot key={type} item={item} onRemove={onRemove} label={type} />;
        })}
      </div>

      <div style={styles.totalRow}>
        <span style={styles.totalLabel}>Total Cost</span>
        <span style={styles.totalValue}>
          <span style={styles.robuxIconLg}>R$</span> {totalPrice.toLocaleString()}
        </span>
      </div>

      <div style={styles.outfitActions}>
        <button style={styles.shareBtn} onClick={onShare} disabled={outfit.length === 0}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ marginRight: 6 }}>
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share Outfit
        </button>
        <button style={styles.clearBtn} onClick={onClear} disabled={outfit.length === 0}>
          Clear All
        </button>
      </div>
    </div>
  );
}

function ShareModal({ outfit, onClose }) {
  const code = generateShareCode(outfit);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.modalTitle}>Share Your Drip</h3>
        <p style={styles.modalDesc}>Send this link to your friends so they can check out your outfit.</p>
        <div style={styles.shareLinkRow}>
          <code style={styles.shareCode}>{code}</code>
          <button style={styles.copyBtn} onClick={handleCopy}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div style={styles.outfitSummary}>
          {outfit.map((item) => (
            <span key={item.id} style={styles.summaryChip}>
              {item.name}
            </span>
          ))}
        </div>
        <div style={styles.modalTotal}>
          Total: <span style={styles.robuxIconLg}>R$</span> {outfit.reduce((s, i) => s + i.price, 0).toLocaleString()}
        </div>
        <button style={styles.modalClose} onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}

function TrendingBar() {
  return (
    <div style={styles.trendingBar}>
      <span style={styles.trendingLabel}>TRENDING</span>
      <span style={styles.trendingItem}>Emo Hair + Tactical Vest</span>
      <span style={styles.trendingDot}>·</span>
      <span style={styles.trendingItem}>Headless + Korblox</span>
      <span style={styles.trendingDot}>·</span>
      <span style={styles.trendingItem}>Anime Sword + Demon Horns</span>
      <span style={styles.trendingDot}>·</span>
      <span style={styles.trendingItem}>Neon Wings + Gold Chain</span>
    </div>
  );
}

// --- Main App ---
export default function RobloxOutfitBuilder() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [outfit, setOutfit] = useState([]);
  const [showShare, setShowShare] = useState(false);
  const [toast, setToast] = useState(null);

  const filteredItems = MOCK_ITEMS.filter((item) => {
    const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = activeCategory === "All" || item.type === activeCategory;
    return matchesQuery && matchesCategory;
  });

  const addToOutfit = useCallback(
    (item) => {
      const existing = outfit.find((i) => i.type === item.type);
      if (existing && existing.id === item.id) {
        setOutfit(outfit.filter((i) => i.id !== item.id));
        showToast(`Removed ${item.name}`);
        return;
      }
      if (existing) {
        setOutfit(outfit.map((i) => (i.type === item.type ? item : i)));
        showToast(`Swapped to ${item.name}`);
      } else {
        setOutfit([...outfit, item]);
        showToast(`Added ${item.name}`);
      }
    },
    [outfit]
  );

  const removeFromOutfit = useCallback(
    (id) => {
      const item = outfit.find((i) => i.id === id);
      setOutfit(outfit.filter((i) => i.id !== id));
      if (item) showToast(`Removed ${item.name}`);
    },
    [outfit]
  );

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&display=swap');
        :root {
          --bg: #0a0a0f;
          --surface: #13131a;
          --surface-2: #1a1a24;
          --surface-3: #22222e;
          --border: #2a2a38;
          --border-hover: #3a3a4a;
          --text: #e8e8f0;
          --text-muted: #7a7a90;
          --accent: #00e5a0;
          --accent-dim: rgba(0, 229, 160, 0.12);
          --accent-glow: rgba(0, 229, 160, 0.25);
          --danger: #ff4466;
          --robux: #ffd700;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: var(--surface); }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
        input:focus { outline: none; }
        button { cursor: pointer; border: none; }
        button:disabled { opacity: 0.4; cursor: not-allowed; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logoRow}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>◆</span>
            <span style={styles.logoText}>DRIP CHECK</span>
          </div>
          <span style={styles.tagline}>Roblox Outfit Builder</span>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.badge}>MVP</div>
        </div>
      </header>

      <TrendingBar />

      {/* Main Layout */}
      <div style={styles.mainLayout}>
        {/* Catalog Panel */}
        <div style={styles.catalogPanel}>
          <SearchBar query={query} setQuery={setQuery} />
          <CategoryTabs active={activeCategory} setActive={setActiveCategory} />

          <div style={styles.resultsInfo}>
            <span>{filteredItems.length} items</span>
            {query && (
              <span style={styles.clearSearch} onClick={() => setQuery("")}>
                Clear search
              </span>
            )}
          </div>

          <div style={styles.itemsGrid}>
            {filteredItems.map((item, idx) => (
              <div key={item.id} style={{ animation: `fadeInUp 0.3s ease ${idx * 0.04}s both` }}>
                <ItemCard
                  item={item}
                  onAdd={addToOutfit}
                  inOutfit={outfit.some((i) => i.id === item.id)}
                />
              </div>
            ))}
            {filteredItems.length === 0 && (
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
          onClear={() => {
            setOutfit([]);
            showToast("Outfit cleared");
          }}
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
          <strong>MVP Note:</strong> This uses mock data. In production, items are fetched from Roblox's Catalog API via a backend proxy, with real thumbnails and live prices. 3D preview coming in v2.
        </span>
      </div>

      {/* Share Modal */}
      {showShare && <ShareModal outfit={outfit} onClose={() => setShowShare(false)} />}

      {/* Toast */}
      {toast && <div style={styles.toast}>{toast}</div>}
    </div>
  );
}

// --- Styles ---
const styles = {
  root: {
    fontFamily: "'DM Sans', sans-serif",
    color: "var(--text)",
    background: "var(--bg)",
    minHeight: "100vh",
    position: "relative",
  },

  // Header
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    borderBottom: "1px solid var(--border)",
    background: "var(--surface)",
  },
  logoRow: { display: "flex", alignItems: "center", gap: 16 },
  logo: { display: "flex", alignItems: "center", gap: 8 },
  logoIcon: {
    color: "var(--accent)",
    fontSize: 22,
    fontWeight: 700,
    filter: "drop-shadow(0 0 8px var(--accent-glow))",
  },
  logoText: {
    fontFamily: "'Space Mono', monospace",
    fontWeight: 700,
    fontSize: 18,
    letterSpacing: 3,
    color: "var(--text)",
  },
  tagline: {
    fontSize: 13,
    color: "var(--text-muted)",
    borderLeft: "1px solid var(--border)",
    paddingLeft: 16,
  },
  headerRight: { display: "flex", alignItems: "center", gap: 12 },
  badge: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 2,
    color: "var(--accent)",
    background: "var(--accent-dim)",
    padding: "4px 10px",
    borderRadius: 4,
    border: "1px solid rgba(0,229,160,0.2)",
  },

  // Trending
  trendingBar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "8px 24px",
    background: "var(--surface-2)",
    borderBottom: "1px solid var(--border)",
    overflow: "hidden",
    whiteSpace: "nowrap",
    fontSize: 12,
  },
  trendingLabel: {
    fontFamily: "'Space Mono', monospace",
    fontWeight: 700,
    fontSize: 10,
    letterSpacing: 2,
    color: "var(--accent)",
    flexShrink: 0,
  },
  trendingItem: { color: "var(--text-muted)" },
  trendingDot: { color: "var(--border)", fontSize: 16 },

  // Layout
  mainLayout: {
    display: "flex",
    gap: 0,
    minHeight: "calc(100vh - 130px)",
  },
  catalogPanel: {
    flex: 1,
    padding: "20px 24px",
    overflowY: "auto",
  },

  // Search
  searchWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  searchInput: {
    width: "100%",
    padding: "12px 16px 12px 42px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    color: "var(--text)",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.2s",
  },

  // Tabs
  tabsRow: {
    display: "flex",
    gap: 6,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  tab: {
    padding: "6px 14px",
    borderRadius: 8,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    color: "var(--text-muted)",
    fontSize: 12,
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.15s",
  },
  tabActive: {
    background: "var(--accent-dim)",
    borderColor: "var(--accent)",
    color: "var(--accent)",
  },

  // Results
  resultsInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    fontSize: 12,
    color: "var(--text-muted)",
  },
  clearSearch: {
    color: "var(--accent)",
    cursor: "pointer",
    fontSize: 12,
  },

  // Items Grid
  itemsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 12,
  },
  itemCard: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.2s",
    position: "relative",
  },
  itemCardHover: {
    borderColor: "var(--border-hover)",
    transform: "translateY(-2px)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
  },
  itemCardSelected: {
    borderColor: "var(--accent)",
    boxShadow: "0 0 0 1px var(--accent), 0 0 20px var(--accent-glow)",
  },
  itemImageWrap: {
    width: "100%",
    aspectRatio: "1",
    background: "var(--surface-2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  itemImagePlaceholder: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  checkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: "var(--accent)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px var(--accent-glow)",
  },
  itemInfo: {
    padding: "10px 12px",
  },
  itemName: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text)",
    marginBottom: 4,
    lineHeight: 1.3,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  itemMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemType: {
    fontSize: 11,
    color: "var(--text-muted)",
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: 700,
    color: "var(--robux)",
    fontFamily: "'Space Mono', monospace",
  },
  robuxIcon: {
    fontSize: 11,
    opacity: 0.8,
  },
  robuxIconLg: {
    fontSize: 14,
    opacity: 0.8,
    color: "var(--robux)",
  },

  // Outfit Panel
  outfitPanel: {
    width: 320,
    background: "var(--surface)",
    borderLeft: "1px solid var(--border)",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  },
  outfitHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  outfitTitle: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: 1,
  },
  itemCount: {
    fontSize: 12,
    color: "var(--text-muted)",
    background: "var(--surface-2)",
    padding: "3px 8px",
    borderRadius: 6,
  },

  // Slots
  slotsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    marginBottom: 20,
    flex: 1,
  },
  outfitSlotEmpty: {
    background: "var(--surface-2)",
    border: "1px dashed var(--border)",
    borderRadius: 10,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: 90,
  },
  outfitSlotFilled: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minHeight: 90,
    cursor: "pointer",
    transition: "border-color 0.15s",
    position: "relative",
  },
  slotLabel: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 2,
    color: "var(--text-muted)",
    textTransform: "uppercase",
  },
  slotPlaceholder: { opacity: 0.5 },
  slotItemThumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
    background: "var(--surface-3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  slotItemName: {
    fontSize: 11,
    color: "var(--text)",
    textAlign: "center",
    lineHeight: 1.2,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "100%",
  },
  removeX: {
    position: "absolute",
    top: 6,
    right: 6,
  },

  // Total
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 0",
    borderTop: "1px solid var(--border)",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-muted)",
  },
  totalValue: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 18,
    fontWeight: 700,
    color: "var(--robux)",
  },

  // Actions
  outfitActions: {
    display: "flex",
    gap: 8,
  },
  shareBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 16px",
    background: "var(--accent)",
    color: "var(--bg)",
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.15s",
  },
  clearBtn: {
    padding: "10px 16px",
    background: "var(--surface-2)",
    color: "var(--text-muted)",
    borderRadius: 10,
    fontWeight: 500,
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    border: "1px solid var(--border)",
    transition: "all 0.15s",
  },

  // Info Banner
  infoBanner: {
    display: "flex",
    alignItems: "flex-start",
    margin: "0 24px 24px",
    padding: "12px 16px",
    background: "var(--accent-dim)",
    borderRadius: 10,
    border: "1px solid rgba(0,229,160,0.15)",
    fontSize: 12,
    color: "var(--text-muted)",
    lineHeight: 1.5,
  },

  // Modal
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    animation: "fadeInUp 0.2s ease",
  },
  modal: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: 28,
    width: 420,
    maxWidth: "90vw",
    animation: "slideIn 0.25s ease",
  },
  modalTitle: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 8,
  },
  modalDesc: {
    color: "var(--text-muted)",
    fontSize: 13,
    marginBottom: 20,
    lineHeight: 1.5,
  },
  shareLinkRow: {
    display: "flex",
    gap: 8,
    marginBottom: 20,
  },
  shareCode: {
    flex: 1,
    padding: "10px 14px",
    background: "var(--surface-2)",
    borderRadius: 8,
    border: "1px solid var(--border)",
    color: "var(--accent)",
    fontFamily: "'Space Mono', monospace",
    fontSize: 13,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  copyBtn: {
    padding: "10px 20px",
    background: "var(--accent)",
    color: "var(--bg)",
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    flexShrink: 0,
  },
  outfitSummary: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 16,
  },
  summaryChip: {
    padding: "4px 10px",
    background: "var(--surface-2)",
    borderRadius: 6,
    fontSize: 11,
    color: "var(--text-muted)",
    border: "1px solid var(--border)",
  },
  modalTotal: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 16,
    fontWeight: 700,
    color: "var(--text)",
    marginBottom: 20,
  },
  modalClose: {
    width: "100%",
    padding: "12px",
    background: "var(--surface-2)",
    color: "var(--text)",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    border: "1px solid var(--border)",
  },

  // Toast
  toast: {
    position: "fixed",
    bottom: 24,
    left: "50%",
    transform: "translateX(-50%)",
    background: "var(--surface-2)",
    border: "1px solid var(--accent)",
    color: "var(--accent)",
    padding: "10px 24px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 20px var(--accent-glow)",
    zIndex: 200,
    animation: "toastIn 0.25s ease",
  },

  // Empty
  emptyState: {
    gridColumn: "1 / -1",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
  },
};
