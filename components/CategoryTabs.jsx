"use client";

import { CATEGORIES } from "@/lib/constants";
import { styles } from "@/lib/styles";

export default function CategoryTabs({ active, setActive }) {
  return (
    <div style={styles.tabsRow}>
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => setActive(cat)}
          style={{
            ...styles.tab,
            ...(active === cat ? styles.tabActive : {}),
          }}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
