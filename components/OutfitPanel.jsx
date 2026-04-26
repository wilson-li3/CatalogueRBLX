"use client";

import { SLOT_TYPES } from "@/lib/constants";
import { styles } from "@/lib/styles";
import OutfitSlot from "./OutfitSlot";

export default function OutfitPanel({ outfit, onRemove, onClear, onShare }) {
  const totalPrice = outfit.reduce((sum, i) => sum + i.price, 0);

  return (
    <div style={styles.outfitPanel}>
      <div style={styles.outfitHeader}>
        <h2 style={styles.outfitTitle}>Your Outfit</h2>
        <span style={styles.itemCount}>{outfit.length} items</span>
      </div>

      <div style={styles.slotsGrid}>
        {SLOT_TYPES.map((type) => {
          const item = outfit.find((i) => i.type === type);
          return <OutfitSlot key={type} item={item} onRemove={onRemove} label={type} />;
        })}
      </div>

      <div style={styles.totalRow}>
        <span style={styles.totalLabel}>Total Cost</span>
        <span style={styles.totalValue}>
          <span style={styles.robuxIconLg}>R$ </span>{totalPrice.toLocaleString()}
        </span>
      </div>

      <div style={styles.outfitActions}>
        <button style={styles.shareBtn} onClick={onShare} disabled={outfit.length === 0}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ marginRight: 8 }}>
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share Outfit
        </button>
        <button style={styles.clearBtn} onClick={onClear} disabled={outfit.length === 0}>
          Clear
        </button>
      </div>
    </div>
  );
}
