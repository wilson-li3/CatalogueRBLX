"use client";

import { styles } from "@/lib/styles";

export default function SearchBar({ query, setQuery }) {
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
