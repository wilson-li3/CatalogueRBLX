"use client";

import { useState, useEffect, useRef } from "react";

export default function AvatarPreview2D({ equippedAssetIds = [], bodyAssetIds = [], scales }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [prevImageUrl, setPrevImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceTimer = useRef(null);
  const prevKeyRef = useRef("");

  // Merge body part IDs + equipped accessory IDs
  const allAssetIds = [...bodyAssetIds, ...equippedAssetIds];

  useEffect(() => {
    const idsKey = [...allAssetIds].sort((a, b) => a - b).join(",");
    const scalesKey = scales ? Object.values(scales).join(",") : "";
    const fullKey = `${idsKey}|${scalesKey}`;
    if (fullKey === prevKeyRef.current) return;
    prevKeyRef.current = fullKey;

    if (allAssetIds.length === 0) {
      setImageUrl(null);
      setPrevImageUrl(null);
      setError(null);
      return;
    }

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/avatar-render", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assetIds: allAssetIds, scales }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Render failed");
        }

        const data = await res.json();
        setPrevImageUrl(imageUrl);
        setImageUrl(data.imageUrl);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(debounceTimer.current);
  }, [equippedAssetIds, bodyAssetIds, scales]);

  // The image currently visible (show previous while loading new one)
  const displayUrl = imageUrl || prevImageUrl;

  return (
    <div style={styles.container}>
      {/* Loading overlay */}
      {loading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.breathingDot} />
          <span style={styles.loadingText}>Rendering...</span>
        </div>
      )}

      {/* Error display */}
      {error && !loading && (
        <div style={styles.errorContainer}>
          <span style={styles.errorText}>{error}</span>
        </div>
      )}

      {/* Avatar image */}
      {displayUrl ? (
        <img
          src={displayUrl}
          alt="Avatar preview"
          style={{
            ...styles.avatarImage,
            opacity: loading ? 0.5 : 1,
          }}
        />
      ) : (
        <div style={styles.emptyState}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <p style={styles.emptyText}>Add items from the catalog to preview your avatar</p>
        </div>
      )}

      <style>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    position: "relative",
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f0e8dc",
    overflow: "hidden",
  },
  loadingOverlay: {
    position: "absolute",
    top: 16,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 16px",
    background: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(12px)",
    borderRadius: 9999,
    border: "1px solid rgba(180, 160, 140, 0.2)",
    boxShadow: "0 2px 12px rgba(74, 55, 40, 0.06)",
  },
  breathingDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#c4a882",
    animation: "breathe 1.5s ease-in-out infinite",
  },
  loadingText: {
    fontSize: 12,
    fontWeight: 500,
    color: "#8b7a68",
    fontFamily: "'Libre Franklin', sans-serif",
  },
  errorContainer: {
    position: "absolute",
    bottom: 16,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 10,
    padding: "8px 16px",
    background: "rgba(196, 96, 90, 0.08)",
    border: "1px solid rgba(196, 96, 90, 0.2)",
    borderRadius: 12,
  },
  errorText: {
    fontSize: 12,
    color: "#c4605a",
    fontWeight: 500,
    fontFamily: "'Libre Franklin', sans-serif",
  },
  avatarImage: {
    width: "85%",
    maxHeight: "90%",
    objectFit: "contain",
    transition: "opacity 0.3s ease",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    color: "#8b7a68",
  },
  emptyText: {
    fontSize: 13,
    color: "#a0927f",
    textAlign: "center",
    maxWidth: 200,
    lineHeight: 1.5,
    fontFamily: "'Libre Franklin', sans-serif",
  },
};
