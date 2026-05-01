"use client";

import { useState } from "react";
import Link from "next/link";
import { useOutfitContext } from "@/context/OutfitContext";
import { BODY_TYPES } from "@/context/OutfitContext";
import AvatarPreview2D from "./AvatarPreview2D";
import Header from "./Header";
import ShareModal from "./ShareModal";
import Toast from "./Toast";
import { useToast } from "@/hooks/useToast";

export default function TryOnBuilder() {
  const {
    cart, worn, bodyType, bodyTypeIndex,
    toggleWorn, unwear, removeFromCart, clearWorn,
    isWorn, setBodyTypeIndex, renderAssetIds,
    totalWornPrice, totalCartPrice,
  } = useOutfitContext();

  const { toast, showToast } = useToast();
  const [showShare, setShowShare] = useState(false);

  const unwornCart = cart.filter((item) => !isWorn(item.id));

  const handleWear = (item) => {
    toggleWorn(item);
    showToast(isWorn(item.id) ? `Removed ${item.name}` : `Wearing ${item.name}`);
  };

  const handleUnwear = (item) => {
    unwear(item.id);
    showToast(`Removed ${item.name}`);
  };

  const handleRemove = (item) => {
    removeFromCart(item.id);
    showToast(`Removed ${item.name} from cart`);
  };

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", color: "var(--text)", background: "var(--bg)", minHeight: "100vh" }}>
      <Header />

      <div style={s.splitLayout}>
        {/* ===== Left: Avatar Preview ===== */}
        <div style={s.viewportPanel}>
          <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
            <AvatarPreview2D
              equippedAssetIds={worn.map((i) => i.id)}
              bodyAssetIds={bodyType.assetIds}
              scales={bodyType.scales}
            />
          </div>

          {/* Body Type Selector */}
          <div style={s.bodyTypeBar}>
            <span style={s.bodyTypeLabel}>Body</span>
            <div style={s.bodyTypePills}>
              {BODY_TYPES.map((body, idx) => (
                <button
                  key={body.name}
                  onClick={() => setBodyTypeIndex(idx)}
                  title={body.description}
                  style={{
                    ...s.bodyTypePill,
                    ...(bodyTypeIndex === idx ? s.bodyTypePillActive : {}),
                  }}
                >
                  {body.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ===== Right: Outfit Manager ===== */}
        <div style={s.sidebar}>
          {/* Wearing Section */}
          <div style={s.section}>
            <div style={s.sectionHeader}>
              <span style={s.sectionTitle}>Wearing</span>
              <span style={s.sectionCount}>{worn.length}</span>
              {worn.length > 0 && (
                <button onClick={() => { clearWorn(); showToast("Cleared all worn items"); }} style={s.clearBtn}>
                  Clear
                </button>
              )}
            </div>

            {worn.length === 0 ? (
              <div style={s.emptyHint}>
                <p>Select items from your cart below to try them on</p>
              </div>
            ) : (
              <div style={s.itemList}>
                {worn.map((item) => (
                  <div key={item.id} style={s.wornItem}>
                    <div style={s.itemThumb}>
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: "var(--cream-dark)" }} />
                      )}
                      <div style={s.wornBadge}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#f5efe7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={s.itemName}>{item.name}</div>
                      <div style={s.itemType}>{item.type}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={s.itemPrice}>R$ {item.price.toLocaleString()}</div>
                      <button onClick={() => handleUnwear(item)} style={s.removeBtn}>Unwear</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {worn.length > 0 && (
              <div style={s.totalRow}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>Outfit Total</span>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "var(--robux)" }}>
                  R$ {totalWornPrice.toLocaleString()}
                </span>
              </div>
            )}

            {worn.length > 0 && (
              <button onClick={() => setShowShare(true)} style={s.shareBtn}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ marginRight: 6 }}>
                  <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                Share Outfit
              </button>
            )}
          </div>

          {/* Divider */}
          <div style={s.divider} />

          {/* Cart Section */}
          <div style={s.section}>
            <div style={s.sectionHeader}>
              <span style={s.sectionTitle}>In Cart</span>
              <span style={s.sectionCount}>{unwornCart.length}</span>
            </div>

            {cart.length === 0 ? (
              <div style={s.emptyHint}>
                <p>No items in cart yet</p>
                <Link href="/builder" style={s.browseLink}>Browse Catalog</Link>
              </div>
            ) : unwornCart.length === 0 ? (
              <div style={s.emptyHint}>
                <p>All cart items are being worn</p>
                <Link href="/builder" style={s.browseLink}>Add More Items</Link>
              </div>
            ) : (
              <div style={s.itemList}>
                {unwornCart.map((item) => (
                  <div
                    key={item.id}
                    style={s.cartItem}
                    onClick={() => handleWear(item)}
                  >
                    <div style={s.itemThumb}>
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: "var(--cream-dark)" }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={s.itemName}>{item.name}</div>
                      <div style={s.itemType}>{item.type}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={s.itemPrice}>R$ {item.price.toLocaleString()}</div>
                      <div style={s.wearHint}>Tap to wear</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showShare && <ShareModal outfit={worn} onClose={() => setShowShare(false)} />}
      <Toast message={toast} />
    </div>
  );
}

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
    display: "flex",
    flexDirection: "column",
  },
  sidebar: {
    width: 380,
    display: "flex",
    flexDirection: "column",
    borderLeft: "1px solid var(--border)",
    background: "var(--surface)",
    overflowY: "auto",
    overflowX: "hidden",
    flexShrink: 0,
  },
  section: {
    padding: "16px 18px",
    display: "flex",
    flexDirection: "column",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "var(--text-caption)",
  },
  sectionCount: {
    fontSize: 10,
    fontWeight: 700,
    color: "var(--accent-warm)",
    background: "rgba(160, 103, 75, 0.08)",
    padding: "2px 8px",
    borderRadius: 10,
  },
  clearBtn: {
    marginLeft: "auto",
    fontSize: 11,
    color: "var(--danger)",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'Libre Franklin', sans-serif",
  },
  emptyHint: {
    padding: "20px 0",
    textAlign: "center",
    fontSize: 12,
    color: "var(--text-caption)",
    lineHeight: 1.5,
  },
  browseLink: {
    display: "inline-block",
    marginTop: 10,
    padding: "7px 18px",
    borderRadius: 20,
    background: "#4a3728",
    color: "#f5efe7",
    fontSize: 12,
    fontWeight: 600,
    textDecoration: "none",
    fontFamily: "'Libre Franklin', sans-serif",
  },
  itemList: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  wornItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 10px",
    borderRadius: 12,
    background: "rgba(160, 103, 75, 0.04)",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "rgba(160, 103, 75, 0.15)",
    transition: "all 0.2s ease",
  },
  cartItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 10px",
    borderRadius: 12,
    background: "var(--surface-2)",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "rgba(180, 160, 140, 0.1)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  itemThumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
    overflow: "hidden",
    flexShrink: 0,
    background: "var(--surface-3)",
    position: "relative",
  },
  wornBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: "50%",
    background: "var(--accent-warm)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  itemName: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  itemType: {
    fontSize: 10,
    color: "var(--text-caption)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontWeight: 500,
    marginTop: 1,
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: 700,
    color: "var(--robux)",
    fontFamily: "'Playfair Display', serif",
  },
  removeBtn: {
    fontSize: 10,
    color: "var(--text-caption)",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'Libre Franklin', sans-serif",
    marginTop: 2,
  },
  wearHint: {
    fontSize: 10,
    color: "var(--accent-warm)",
    fontWeight: 500,
    marginTop: 2,
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTop: "1px solid var(--border)",
  },
  shareBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    padding: "10px 18px",
    background: "#4a3728",
    color: "#f5efe7",
    borderRadius: 20,
    fontWeight: 700,
    fontSize: 12,
    fontFamily: "'Libre Franklin', sans-serif",
    letterSpacing: "0.03em",
    transition: "all 0.3s ease",
  },
  divider: {
    height: 1,
    background: "var(--border)",
    margin: "0 18px",
  },
  bodyTypeBar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 20px",
    borderTop: "1px solid rgba(180, 160, 140, 0.15)",
    background: "rgba(255, 255, 255, 0.5)",
    backdropFilter: "blur(8px)",
    flexShrink: 0,
  },
  bodyTypeLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "#8b7a68",
    fontFamily: "'Libre Franklin', sans-serif",
    flexShrink: 0,
  },
  bodyTypePills: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
  },
  bodyTypePill: {
    padding: "5px 14px",
    borderRadius: 9999,
    fontSize: 12,
    fontWeight: 500,
    fontFamily: "'Libre Franklin', sans-serif",
    cursor: "pointer",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "rgba(180, 160, 140, 0.3)",
    background: "#f5efe7",
    color: "#6b5e50",
    transition: "all 0.2s ease",
  },
  bodyTypePillActive: {
    background: "rgba(196, 136, 100, 0.12)",
    borderColor: "#c48864",
    color: "#9c5e3a",
    fontWeight: 600,
  },
};
