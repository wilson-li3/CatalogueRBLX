"use client";

import { useState, useCallback } from "react";

export function useOutfit(showToast) {
  const [outfit, setOutfit] = useState([]);

  const addToOutfit = useCallback(
    (item) => {
      const existing = outfit.find((i) => i.type === item.type);
      if (existing && existing.id === item.id) {
        setOutfit(outfit.filter((i) => i.id !== item.id));
        showToast(`Removed ${item.name}`);
        return;
      }
      if (existing) {
        setOutfit(outfit.map((i) => (i.type === item.type ? item : i)));
        showToast(`Swapped to ${item.name}`);
      } else {
        setOutfit([...outfit, item]);
        showToast(`Added ${item.name}`);
      }
    },
    [outfit, showToast]
  );

  const removeFromOutfit = useCallback(
    (id) => {
      const item = outfit.find((i) => i.id === id);
      setOutfit(outfit.filter((i) => i.id !== id));
      if (item) showToast(`Removed ${item.name}`);
    },
    [outfit, showToast]
  );

  const clearOutfit = useCallback(() => {
    setOutfit([]);
    showToast("Outfit cleared");
  }, [showToast]);

  return { outfit, addToOutfit, removeFromOutfit, clearOutfit };
}
