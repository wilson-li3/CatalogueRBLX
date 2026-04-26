"use client";

import { useState } from "react";
import { styles } from "@/lib/styles";

export default function OutfitSlot({ item, onRemove, label }) {
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
        {item.thumbnail ? (
          <img src={item.thumbnail} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        )}
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
