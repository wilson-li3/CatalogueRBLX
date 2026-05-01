"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";

const OutfitContext = createContext();

const BODY_TYPES = [
  {
    name: "Default",
    description: "Classic blocky R15",
    assetIds: [],
    scales: { bodyType: 0, height: 1, width: 1, depth: 1, head: 1, proportion: 0 },
  },
  {
    name: "Woman",
    description: "Roblox Woman body",
    assetIds: [86499666, 86499698, 86499716, 86499753, 86499793],
    scales: { bodyType: 0, height: 1, width: 1, depth: 1, head: 1, proportion: 0 },
  },
  {
    name: "Man",
    description: "Roblox Man body",
    assetIds: [86500008, 86500036, 86500054, 86500064, 86500078],
    scales: { bodyType: 0, height: 1, width: 1, depth: 1, head: 1, proportion: 0 },
  },
  {
    name: "2.0",
    description: "Robloxian 2.0",
    assetIds: [27112025, 27112039, 27112052, 27112056, 27112068],
    scales: { bodyType: 0, height: 1, width: 1, depth: 1, head: 1, proportion: 0 },
  },
  {
    name: "Superhero",
    description: "Superhero body",
    assetIds: [32336059, 32336117, 32336182, 32336243, 32336306],
    scales: { bodyType: 0, height: 1, width: 1, depth: 1, head: 1, proportion: 0 },
  },
  {
    name: "Rthro",
    description: "City Life proportions",
    assetIds: [2490651894, 2490653036, 2490659002, 2490660219, 2490661289],
    scales: { bodyType: 1, height: 1.05, width: 0.7, depth: 0.7, head: 0.95, proportion: 0.5 },
  },
];

export { BODY_TYPES };

export function OutfitProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [worn, setWorn] = useState([]);
  const [bodyTypeIndex, setBodyTypeIndex] = useState(0);

  const bodyType = BODY_TYPES[bodyTypeIndex];

  const addToCart = useCallback((item) => {
    setCart((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      return [...prev, item];
    });
  }, []);

  const removeFromCart = useCallback((itemId) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
    setWorn((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  const toggleWorn = useCallback((item) => {
    // First ensure it's in the cart
    setCart((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      return [...prev, item];
    });
    setWorn((prev) => {
      if (prev.some((i) => i.id === item.id)) {
        return prev.filter((i) => i.id !== item.id);
      }
      return [...prev, item];
    });
  }, []);

  const unwear = useCallback((itemId) => {
    setWorn((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  const clearWorn = useCallback(() => setWorn([]), []);
  const clearCart = useCallback(() => {
    setCart([]);
    setWorn([]);
  }, []);

  const isInCart = useCallback((itemId) => cart.some((i) => i.id === itemId), [cart]);
  const isWorn = useCallback((itemId) => worn.some((i) => i.id === itemId), [worn]);

  const totalCartPrice = useMemo(() => cart.reduce((sum, i) => sum + (i.price || 0), 0), [cart]);
  const totalWornPrice = useMemo(() => worn.reduce((sum, i) => sum + (i.price || 0), 0), [worn]);

  // All asset IDs to send to the render API
  const renderAssetIds = useMemo(
    () => [...bodyType.assetIds, ...worn.map((i) => i.id)],
    [bodyType, worn]
  );

  return (
    <OutfitContext.Provider
      value={{
        cart,
        worn,
        bodyType,
        bodyTypeIndex,
        addToCart,
        removeFromCart,
        toggleWorn,
        unwear,
        clearWorn,
        clearCart,
        isInCart,
        isWorn,
        setBodyTypeIndex,
        totalCartPrice,
        totalWornPrice,
        renderAssetIds,
      }}
    >
      {children}
    </OutfitContext.Provider>
  );
}

export function useOutfitContext() {
  const ctx = useContext(OutfitContext);
  if (!ctx) throw new Error("useOutfitContext must be used within OutfitProvider");
  return ctx;
}
