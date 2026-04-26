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
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "var(--text)", marginBottom: 12 }}>
            Outfit Not Found
          </h1>
          <p style={{ color: "var(--text-muted)", marginBottom: 28, fontSize: 14 }}>
            This outfit doesn&apos;t exist or has been removed.
          </p>
          <Link href="/" style={{
            color: "#f5efe7",
            background: "var(--accent)",
            padding: "12px 28px",
            borderRadius: 24,
            fontWeight: 600,
            fontSize: 13,
            textDecoration: "none",
            letterSpacing: "0.03em",
          }}>
            Build your own outfit
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
      <header style={styles.header}>
        <div style={styles.logoRow}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={styles.logoIcon} />
            <span style={styles.logoText}>drip check</span>
          </Link>
          <span style={styles.tagline}>Shared Outfit</span>
        </div>
      </header>

      <div style={{ maxWidth: 620, margin: "0 auto", padding: "36px 24px" }}>
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-light)", marginBottom: 8 }}>
            Curated
          </p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "var(--text)" }}>
            Shared Outfit
          </h2>
          <div style={{ width: 40, height: 2, background: "var(--blush)", marginTop: 12, borderRadius: 1, opacity: 0.5 }} />
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(145px, 1fr))",
          gap: 12,
          marginBottom: 28,
        }}>
          {outfit.items.map((item) => (
            <div key={item.id} style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 20,
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
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--blush)", opacity: 0.15 }} />
                )}
              </div>
              <div style={{ padding: "10px 12px" }}>
                <div style={styles.itemType}>{item.type}</div>
                <div style={styles.itemName}>{item.name}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: "var(--text-light)" }}>by {item.creatorName || "Creator"}</span>
                  <span style={styles.itemPrice}>
                    <span style={styles.robuxIcon}>R$</span> {item.price.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {SLOT_TYPES.filter((t) => !outfit.items.some((i) => i.type === t)).length > 0 && (
          <p style={{ color: "var(--text-caption)", fontSize: 12, marginBottom: 24, fontWeight: 500 }}>
            Empty slots: {SLOT_TYPES.filter((t) => !outfit.items.some((i) => i.type === t)).join(", ")}
          </p>
        )}

        <div style={styles.totalRow}>
          <span style={styles.totalLabel}>Total Cost</span>
          <span style={styles.totalValue}>
            <span style={styles.robuxIconLg}>R$ </span>{outfit.totalPrice.toLocaleString()}
          </span>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button
            onClick={handleVote}
            disabled={voting}
            style={{
              padding: "12px 24px",
              borderRadius: 24,
              fontWeight: 700,
              fontSize: 13,
              fontFamily: "'Libre Franklin', sans-serif",
              letterSpacing: "0.03em",
              background: voted ? "var(--accent)" : "transparent",
              color: voted ? "#f5efe7" : "var(--text-muted)",
              borderWidth: 1.5,
              borderStyle: "solid",
              borderColor: voted ? "var(--accent)" : "rgba(180, 160, 140, 0.18)",
              transition: "all 0.3s ease",
              cursor: "pointer",
            }}
          >
            {voted ? "\u2605" : "\u2606"} {voteCount} {voteCount === 1 ? "vote" : "votes"}
          </button>

          <Link href="/" style={{ textDecoration: "none", flex: 1 }}>
            <button style={{ ...styles.shareBtn, width: "100%" }}>
              Build Your Own
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
