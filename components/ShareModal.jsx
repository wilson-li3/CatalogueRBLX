"use client";

import { useState } from "react";
import { styles } from "@/lib/styles";

export default function ShareModal({ outfit, onClose }) {
  const [shareUrl, setShareUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/outfits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: outfit }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }
      const data = await res.json();
      setShareUrl(`${window.location.origin}/outfit/${data.slug}`);
    } catch (err) {
      setError(err.message);
      // Fallback to client-side code
      const ids = outfit.map((i) => i.id).join(",");
      setShareUrl(`${window.location.origin}/outfit?items=${ids}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Auto-save on mount
  if (!shareUrl && !saving && !error) {
    handleSave();
  }

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.modalTitle}>Share Your Drip</h3>
        <p style={styles.modalDesc}>Send this link to your friends so they can check out your outfit.</p>

        <div style={styles.shareLinkRow}>
          {saving ? (
            <code style={{ ...styles.shareCode, opacity: 0.5 }}>Generating link...</code>
          ) : (
            <code style={styles.shareCode}>{shareUrl || "Error generating link"}</code>
          )}
          <button style={styles.copyBtn} onClick={handleCopy} disabled={!shareUrl}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {error && (
          <p style={{ color: "var(--text-muted)", fontSize: 11, marginBottom: 12 }}>
            Note: Using fallback link (Supabase not configured)
          </p>
        )}

        <div style={styles.outfitSummary}>
          {outfit.map((item) => (
            <span key={item.id} style={styles.summaryChip}>
              {item.name}
            </span>
          ))}
        </div>
        <div style={styles.modalTotal}>
          Total: <span style={styles.robuxIconLg}>R$</span> {outfit.reduce((s, i) => s + i.price, 0).toLocaleString()}
        </div>
        <button style={styles.modalClose} onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}
