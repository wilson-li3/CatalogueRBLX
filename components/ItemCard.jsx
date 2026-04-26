"use client";

import { useState } from "react";
import { styles } from "@/lib/styles";

export default function ItemCard({ item, onAdd, inOutfit }) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

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
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" opacity="0.4">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}
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
