"use client";

import { useState } from "react";
import { styles } from "@/lib/styles";

const WARM_COLORS = ["#d4a373", "#c9a690", "#ddb892", "#b08968", "#c4a882", "#cdb4a0", "#e6ccb2", "#b5838d"];

export default function ItemCard({ item, onAdd, inOutfit }) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const colorIdx = (item.id || 0) % WARM_COLORS.length;
  const warmColor = WARM_COLORS[colorIdx];

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
      <div style={{
        ...styles.itemImageWrap,
        background: item.thumbnail && !imgError
          ? "var(--surface-2)"
          : `linear-gradient(145deg, ${warmColor}10, ${warmColor}06)`,
      }}>
        {item.thumbnail && !imgError ? (
          <img
            src={item.thumbnail}
            alt={item.name}
            loading="lazy"
            onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={styles.itemImagePlaceholder}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${warmColor}20, ${warmColor}0a)`,
              border: `1.5px solid ${warmColor}18`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${warmColor}25` }} />
            </div>
          </div>
        )}
        {inOutfit && (
          <div style={styles.checkBadge}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f5efe7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        )}
      </div>
      <div style={styles.itemInfo}>
        <div style={styles.itemType}>{item.type}</div>
        <div style={styles.itemName}>{item.name}</div>
        <div style={styles.itemMeta}>
          <span style={{ fontSize: 11, color: "var(--text-light)", fontWeight: 400 }}>
            by {item.creatorName}
          </span>
          <span style={styles.itemPrice}>
            <span style={styles.robuxIcon}>R$</span> {item.price.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
