"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useOutfitContext } from "@/context/OutfitContext";
import AvatarPreview2D from "./AvatarPreview2D";
import Header from "./Header";
import Toast from "./Toast";
import { useToast } from "@/hooks/useToast";

export default function SharedOutfitView() {
  const searchParams = useSearchParams();
  const { addToCart, isInCart } = useOutfitContext();
  const { toast, showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const itemIds = (searchParams.get("items") || "").split(",").filter(Boolean).map(Number);
  const bodyParam = searchParams.get("body") || "0";
  const bodyIndex = parseInt(bodyParam, 10) || 0;

  // Fetch item details for display
  useEffect(() => {
    if (itemIds.length === 0) {
      setLoading(false);
      return;
    }

    // Fetch thumbnails for display
    fetch(`/api/thumbnails?ids=${itemIds.join(",")}&size=150x150`)
      .then((r) => r.json())
      .then((data) => {
        const fetchedItems = (data.data || []).map((t) => ({
          id: t.targetId,
          name: `Item #${t.targetId}`,
          thumbnail: t.state === "Completed" ? t.imageUrl : null,
          price: 0,
          type: "Accessory",
        }));
        // Include any IDs that didn't return thumbnails
        const fetchedIds = new Set(fetchedItems.map((i) => i.id));
        const missing = itemIds
          .filter((id) => !fetchedIds.has(id))
          .map((id) => ({ id, name: `Item #${id}`, thumbnail: null, price: 0, type: "Accessory" }));
        setItems([...fetchedItems, ...missing]);
      })
      .catch(() => {
        setItems(itemIds.map((id) => ({ id, name: `Item #${id}`, thumbnail: null, price: 0, type: "Accessory" })));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleAddToCart = (item) => {
    addToCart(item);
    showToast(`Added ${item.name} to cart`);
  };

  if (itemIds.length === 0) {
    return (
      <div style={{ fontFamily: "'Libre Franklin', sans-serif", color: "var(--text)", background: "var(--bg)", minHeight: "100vh" }}>
        <Header />
        <div style={{ padding: 60, textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, marginBottom: 12 }}>No Outfit Found</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>This link doesn't contain any outfit items.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", color: "var(--text)", background: "var(--bg)", minHeight: "100vh" }}>
      <Header />

      <div style={sv.layout}>
        {/* Preview */}
        <div style={sv.previewArea}>
          <AvatarPreview2D equippedAssetIds={itemIds} bodyAssetIds={[]} scales={undefined} />
        </div>

        {/* Info panel */}
        <div style={sv.infoPanel}>
          <h2 style={sv.title}>Shared Outfit</h2>
          <p style={sv.subtitle}>{itemIds.length} items in this look</p>

          <div style={sv.itemList}>
            {loading ? (
              <div style={{ padding: 20, textAlign: "center", color: "var(--text-caption)", fontSize: 12 }}>Loading items...</div>
            ) : (
              items.map((item) => (
                <div key={item.id} style={sv.item}>
                  <div style={sv.itemThumb}>
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "var(--cream-dark)" }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={sv.itemName}>{item.name}</div>
                    <div style={sv.itemId}>ID: {item.id}</div>
                  </div>
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={isInCart(item.id)}
                    style={{
                      ...sv.addBtn,
                      ...(isInCart(item.id) ? { opacity: 0.5, cursor: "default" } : {}),
                    }}
                  >
                    {isInCart(item.id) ? "In Cart" : "+ Add"}
                  </button>
                </div>
              ))
            )}
          </div>

          <button onClick={handleCopyLink} style={sv.copyBtn}>
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      </div>

      <Toast message={toast} />
    </div>
  );
}

const sv = {
  layout: {
    display: "flex",
    minHeight: "calc(100vh - 64px)",
  },
  previewArea: {
    flex: 1,
    background: "#f0e8dc",
    minHeight: 400,
  },
  infoPanel: {
    width: 380,
    background: "var(--surface)",
    borderLeft: "1px solid var(--border)",
    padding: "28px 24px",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 22,
    fontWeight: 700,
    color: "var(--text)",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "var(--text-muted)",
    marginBottom: 24,
  },
  itemList: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    overflowY: "auto",
    marginBottom: 20,
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 12,
    background: "var(--surface-2)",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "rgba(180, 160, 140, 0.1)",
  },
  itemThumb: {
    width: 40,
    height: 40,
    borderRadius: 10,
    overflow: "hidden",
    flexShrink: 0,
    background: "var(--surface-3)",
  },
  itemName: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  itemId: {
    fontSize: 10,
    color: "var(--text-caption)",
    marginTop: 2,
  },
  addBtn: {
    padding: "6px 14px",
    borderRadius: 16,
    background: "rgba(160, 103, 75, 0.08)",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "rgba(160, 103, 75, 0.15)",
    color: "var(--accent-warm)",
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "'Libre Franklin', sans-serif",
    cursor: "pointer",
    flexShrink: 0,
    transition: "all 0.2s ease",
  },
  copyBtn: {
    padding: "12px 18px",
    background: "#4a3728",
    color: "#f5efe7",
    borderRadius: 20,
    fontWeight: 700,
    fontSize: 13,
    fontFamily: "'Libre Franklin', sans-serif",
    letterSpacing: "0.03em",
    transition: "all 0.3s ease",
    flexShrink: 0,
  },
};
