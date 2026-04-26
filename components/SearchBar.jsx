"use client";

import { styles } from "@/lib/styles";

export default function SearchBar({ query, setQuery }) {
  return (
    <div style={styles.searchWrapper}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-caption)" strokeWidth="2" strokeLinecap="round" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        placeholder="Search items, styles, creators..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={styles.searchInput}
      />
    </div>
  );
}
