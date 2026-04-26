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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-caption)" strokeWidth="1.5" opacity="0.5">
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
          <div style={{ width: 16, height: 16, borderRadius: "50%", background: "var(--blush)", opacity: 0.3 }} />
        )}
      </div>
      <div style={styles.slotItemName}>{item.name}</div>
      {hovered && (
        <div style={styles.removeX}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="3" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
      )}
    </div>
  );
}
