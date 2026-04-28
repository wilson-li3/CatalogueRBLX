"use client";

import { useState, useCallback, useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { Mannequin } from "@/components/Mannequin";
import { AccessoryMesh } from "@/components/AccessoryMesh";

export default function AvatarViewer({ outfit = [], onRemoveItem }) {
  // Map of assetId -> { data, loading, error, itemType }
  const [equippedItems, setEquippedItems] = useState({});
  const meshCache = useRef({});
  const prevOutfitRef = useRef([]);

  // Fetch raw mesh + attachment data from the unified asset-mesh endpoint
  const fetchItemData = useCallback(async (assetId, itemType) => {
    if (meshCache.current[assetId]) {
      setEquippedItems((prev) => ({
        ...prev,
        [assetId]: { data: meshCache.current[assetId], loading: false, error: null, itemType },
      }));
      return;
    }

    setEquippedItems((prev) => ({
      ...prev,
      [assetId]: { data: null, loading: true, error: null, itemType },
    }));

    try {
      const res = await fetch(`/api/asset-mesh?assetId=${assetId}`);
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || `Failed to load mesh (${res.status})`);
      }

      const data = await res.json();
      meshCache.current[assetId] = data;
      setEquippedItems((prev) => ({
        ...prev,
        [assetId]: { data, loading: false, error: null, itemType },
      }));
    } catch (err) {
      setEquippedItems((prev) => ({
        ...prev,
        [assetId]: { data: null, loading: false, error: err.message, itemType },
      }));
    }
  }, []);

  // Sync outfit changes → equippedItems
  // Using a ref comparison to avoid re-running on every render
  if (outfit !== prevOutfitRef.current) {
    prevOutfitRef.current = outfit;
    const outfitIds = new Set(outfit.map((i) => i.id));

    // Add new items
    for (const item of outfit) {
      if (!equippedItems[item.id]) {
        fetchItemData(item.id, item.type);
      }
    }

    // Remove items no longer in outfit (done via setState to batch)
    const toRemove = Object.keys(equippedItems).filter((id) => !outfitIds.has(Number(id)));
    if (toRemove.length > 0) {
      setEquippedItems((prev) => {
        const next = { ...prev };
        for (const id of toRemove) delete next[id];
        return next;
      });
    }
  }

  const loadingItemCount = Object.values(equippedItems).filter((e) => e.loading).length;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Canvas
        shadows
        camera={{ position: [0, 1.5, 6], fov: 35 }}
        style={{ background: "transparent" }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} color="#faf6f0" />
        <directionalLight
          position={[3, 5, 4]}
          intensity={0.9}
          color="#fff5e6"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-3, 3, -2]} intensity={0.3} color="#e6d5c0" />
        <directionalLight position={[0, 2, -5]} intensity={0.2} color="#ddb892" />

        <color attach="background" args={["#f0e8dc"]} />

        <ContactShadows
          position={[0, -2, 0]}
          opacity={0.15}
          scale={10}
          blur={2}
          far={6}
          color="#4a3728"
        />

        {/* Static mannequin — always visible */}
        <Suspense fallback={null}>
          <Mannequin color="#c8b8a4" />
        </Suspense>

        {/* Equipped item meshes */}
        {Object.entries(equippedItems).map(([assetId, entry]) => (
          entry.data && (
            <AccessoryMesh
              key={assetId}
              data={entry.data}
              itemType={entry.itemType}
            />
          )
        ))}

        <OrbitControls
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.6}
          zoomSpeed={0.8}
          minDistance={2}
          maxDistance={12}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
          target={[0, 0.5, 0]}
        />
      </Canvas>

      {/* Outfit overlay — items being tried on */}
      {outfit.length > 0 && (
        <div style={{
          position: "absolute", top: 16, left: 16, zIndex: 10,
          maxWidth: 220, maxHeight: "calc(100% - 80px)",
          display: "flex", flexDirection: "column", gap: 0,
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(12px)",
          borderRadius: 16,
          border: "1px solid rgba(180, 160, 140, 0.2)",
          boxShadow: "0 4px 24px rgba(74, 55, 40, 0.08)",
          overflow: "hidden",
        }}>
          <div style={{
            padding: "12px 14px 8px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.15em",
              textTransform: "uppercase", color: "var(--text-caption)",
            }}>
              Trying On ({outfit.length})
              {loadingItemCount > 0 && (
                <span style={{ fontWeight: 400, letterSpacing: 0 }}>
                  {" "}&middot; loading {loadingItemCount}...
                </span>
              )}
            </span>
            <span style={{
              fontSize: 12, fontWeight: 700,
              color: "var(--robux)",
              fontFamily: "'Playfair Display', serif",
            }}>
              R$ {outfit.reduce((s, i) => s + i.price, 0).toLocaleString()}
            </span>
          </div>

          <div style={{
            padding: "4px 10px 12px",
            overflowY: "auto",
            display: "flex", flexDirection: "column", gap: 6,
          }}>
            {outfit.map((item, idx) => {
              const entry = equippedItems[item.id];
              const isItemLoading = entry?.loading;
              const itemError = entry?.error;
              return (
                <div
                  key={item.id}
                  onClick={() => onRemoveItem && onRemoveItem(item.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "6px 8px",
                    borderRadius: 10,
                    background: itemError
                      ? "rgba(196, 96, 90, 0.06)"
                      : "rgba(255, 255, 255, 0.6)",
                    border: `1px solid ${itemError ? "rgba(196, 96, 90, 0.2)" : "rgba(180, 160, 140, 0.12)"}`,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    animation: `outfitItemIn 0.3s cubic-bezier(0.23, 1, 0.32, 1) ${idx * 0.05}s both`,
                  }}
                >
                  <div style={{ position: "relative", width: 36, height: 36, flexShrink: 0 }}>
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.name}
                        style={{
                          width: 36, height: 36, borderRadius: 8,
                          objectFit: "cover",
                          background: "var(--surface-2)",
                          opacity: isItemLoading ? 0.5 : 1,
                        }}
                      />
                    ) : (
                      <div style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: "var(--cream-dark)",
                      }} />
                    )}
                    {isItemLoading && (
                      <div style={{
                        position: "absolute", inset: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <div style={{
                          width: 14, height: 14,
                          borderWidth: 2, borderStyle: "solid",
                          borderColor: "var(--blush)", borderTopColor: "transparent",
                          borderRadius: "50%", animation: "spin 0.8s linear infinite",
                        }} />
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 11, fontWeight: 600,
                      color: "var(--text)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: 10, color: itemError ? "var(--danger)" : "var(--text-caption)" }}>
                      {itemError ? "3D unavailable" : item.type}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 10, color: "var(--text-caption)",
                    flexShrink: 0, opacity: 0.5,
                  }}>
                    {"\u2715"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Controls hint */}
      <div style={{
        position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
        display: "flex", alignItems: "center", gap: 8,
        padding: "8px 16px", background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(8px)", borderRadius: 9999,
        borderWidth: 1, borderStyle: "solid", borderColor: "rgba(180, 160, 140, 0.15)",
        fontSize: 11, color: "var(--text-muted)", fontWeight: 500,
        pointerEvents: "none",
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4">
          <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
        Drag to rotate · Scroll to zoom
      </div>

      {/* Hint when no items equipped */}
      {outfit.length === 0 && (
        <div style={{
          position: "absolute", top: 16, left: 16, zIndex: 5,
          padding: "10px 14px",
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(8px)",
          borderRadius: 12,
          border: "1px solid rgba(180, 160, 140, 0.15)",
          maxWidth: 200,
        }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
            Add items from the catalog to try them on the mannequin
          </div>
        </div>
      )}
    </div>
  );
}
