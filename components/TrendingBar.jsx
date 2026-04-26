"use client";

import { useState, useEffect } from "react";
import { styles } from "@/lib/styles";

const FALLBACK_TRENDS = [
  "Emo Hair + Tactical Vest",
  "Headless + Korblox",
  "Anime Sword + Demon Horns",
  "Neon Wings + Gold Chain",
];

export default function TrendingBar() {
  const [trends, setTrends] = useState(FALLBACK_TRENDS);

  useEffect(() => {
    fetch("/api/trending?period=week&limit=5")
      .then((r) => r.json())
      .then((data) => {
        if (data.outfits && data.outfits.length > 0) {
          setTrends(
            data.outfits.map((o) =>
              o.items.map((i) => i.name).slice(0, 2).join(" + ")
            )
          );
        }
      })
      .catch(() => {
        // Keep fallback
      });
  }, []);

  return (
    <div style={styles.trendingBar}>
      <span style={styles.trendingLabel}>TRENDING</span>
      {trends.map((trend, i) => (
        <span key={i}>
          <span style={styles.trendingItem}>{trend}</span>
          {i < trends.length - 1 && <span style={styles.trendingDot}> · </span>}
        </span>
      ))}
    </div>
  );
}
