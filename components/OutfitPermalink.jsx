"use client";

import { useState } from "react";
import { styles } from "@/lib/styles";
import { SLOT_TYPES } from "@/lib/constants";
import Link from "next/link";

export default function OutfitPermalink({ outfit, slug }) {
  const [voteCount, setVoteCount] = useState(outfit?.voteCount || 0);
  const [voted, setVoted] = useState(false);
  const [voting, setVoting] = useState(false);

  if (!outfit) {
    return (
      <div style={styles.root}>
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
          <h1 style={{ fontFamily: "'Space Mono', monospace", fontSize: 24, color: "var(--text)", marginBottom: 12 }}>
            Outfit Not Found
          </h1>
          <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
            This outfit doesn&apos;t exist or has been removed.
          </p>
          <Link href="/" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>
            ← Build your own outfit
          </Link>
        </div>
      </div>
    );
  }

  const handleVote = async () => {
    setVoting(true);
    try {
      const res = await fetch(`/api/outfits/${slug}`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setVoteCount(data.voteCount);
        setVoted(data.voted);
      }
    } finally {
      setVoting(false);
    }
  };

  return (
    <div style={styles.root}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logoRow}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={styles.logoIcon}>&#9670;</span>
            <span style={styles.logoText}>DRIP CHECK</span>
          </Link>
          <span style={styles.tagline}>Shared Outfit</span>
        </div>
      </header>

      <div style={{
        maxWidth: 600,
        margin: "0 auto",
        padding: "32px 24px",
      }}>
        {/* Outfit Items */}
        <h2 style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 20,
          fontWeight: 700,
          marginBottom: 20,
          color: "var(--text)",
        }}>
          Outfit ({outfit.items.length} items)
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}>
          {outfit.items.map((item) => (
            <div key={item.id} style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              overflow: "hidden",
            }}>
              <div style={{
                width: "100%",
                aspectRatio: "1",
                background: "var(--surface-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" opacity="0.4">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                  </svg>
                )}
              </div>
              <div style={{ padding: "8px 10px" }}>
                <div style={styles.itemName}>{item.name}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={styles.itemType}>{item.type}</span>
                  <span style={styles.itemPrice}>
                    <span style={styles.robuxIcon}>R$</span> {item.price.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty slots */}
        {SLOT_TYPES.filter((t) => !outfit.items.some((i) => i.type === t)).length > 0 && (
          <p style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 24 }}>
            Empty slots: {SLOT_TYPES.filter((t) => !outfit.items.some((i) => i.type === t)).join(", ")}
          </p>
        )}

        {/* Total + Actions */}
        <div style={{
          ...styles.totalRow,
          borderTop: "1px solid var(--border)",
          paddingTop: 16,
        }}>
          <span style={styles.totalLabel}>Total Cost</span>
          <span style={styles.totalValue}>
            <span style={styles.robuxIconLg}>R$</span> {outfit.totalPrice.toLocaleString()}
          </span>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button
            onClick={handleVote}
            disabled={voting}
            style={{
              ...styles.shareBtn,
              background: voted ? "var(--accent)" : "var(--surface-2)",
              color: voted ? "var(--bg)" : "var(--text)",
              border: `1px solid ${voted ? "var(--accent)" : "var(--border)"}`,
              flex: "none",
              padding: "10px 20px",
            }}
          >
            {voted ? "★" : "☆"} {voteCount} {voteCount === 1 ? "vote" : "votes"}
          </button>

          <Link href="/" style={{ textDecoration: "none", flex: 1 }}>
            <button style={styles.shareBtn}>
              Build Your Own
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
