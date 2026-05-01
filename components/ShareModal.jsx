"use client";

import { useState } from "react";
import { styles } from "@/lib/styles";

export default function ShareModal({ outfit, onClose }) {
  const [copied, setCopied] = useState(false);

  const ids = outfit.map((i) => i.id).join(",");
  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/outfit?items=${ids}`
    : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.modalTitle}>Share Your Drip</h3>
        <p style={styles.modalDesc}>Send this link to your friends so they can check out your outfit.</p>

        <div style={styles.shareLinkRow}>
          <code style={styles.shareCode}>{shareUrl}</code>
          <button style={styles.copyBtn} onClick={handleCopy}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

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
