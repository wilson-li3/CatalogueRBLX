"use client";

import { styles } from "@/lib/styles";

export default function Header() {
  return (
    <header style={styles.header}>
      <div style={styles.logoRow}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>&#9670;</span>
          <span style={styles.logoText}>DRIP CHECK</span>
        </div>
        <span style={styles.tagline}>Roblox Outfit Builder</span>
      </div>
      <div style={styles.headerRight}>
        <div style={styles.badge}>MVP</div>
      </div>
    </header>
  );
}
