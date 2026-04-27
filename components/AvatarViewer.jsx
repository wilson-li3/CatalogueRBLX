"use client";

import { useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { Avatar } from "@/components/Avatar";

function LoadingIndicator() {
  return (
    <mesh position={[0, 0, -5]}>
      <boxGeometry args={[1, 1.5, 0.5]} />
      <meshStandardMaterial color="#ddb892" opacity={0.3} transparent />
    </mesh>
  );
}

export default function AvatarViewer({ username, outfit = [], onRemoveItem }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/avatar?username=${encodeURIComponent(username)}`)
      .then((res) => {
        if (!res.ok) return res.json().then((d) => { throw new Error(d.error || "Failed to load avatar"); });
        return res.json();
      })
      .then((d) => { if (!cancelled) setData(d); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [username]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Loading overlay */}
      {loading && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(250, 246, 240, 0.6)", backdropFilter: "blur(4px)",
        }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 32, height: 32,
              borderWidth: 2, borderStyle: "solid", borderColor: "var(--blush)",
              borderTopColor: "transparent", borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }} />
            <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>
              Loading {username}&apos;s avatar...
            </span>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && !loading && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(250, 246, 240, 0.6)", backdropFilter: "blur(4px)",
        }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center", padding: "0 32px" }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              background: "rgba(196, 96, 90, 0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ color: "var(--danger)", fontSize: 18 }}>{"\u2715"}</span>
            </div>
            <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>
              Couldn&apos;t load avatar
            </span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {error}
            </span>
          </div>
        </div>
      )}

      <Suspense fallback={null}>
        <Canvas
          shadows
          camera={{ position: [0, 1.2, 5], fov: 35 }}
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

          {/* Background */}
          <color attach="background" args={["#f0e8dc"]} />

          {/* Floor shadow */}
          <ContactShadows
            position={[0, -0.01, 0]}
            opacity={0.15}
            scale={10}
            blur={2}
            far={4}
            color="#4a3728"
          />

          {/* Avatar */}
          {data && !loading && !error && <Avatar data={data} />}

          {/* Loading placeholder */}
          {loading && <LoadingIndicator />}

          {/* Orbit controls */}
          <OrbitControls
            enableDamping
            dampingFactor={0.08}
            rotateSpeed={0.6}
            zoomSpeed={0.8}
            minDistance={2}
            maxDistance={12}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI - Math.PI / 6}
            target={[0, 0.8, 0]}
          />
        </Canvas>
      </Suspense>

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
            {outfit.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => onRemoveItem && onRemoveItem(item.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "6px 8px",
                  borderRadius: 10,
                  background: "rgba(255, 255, 255, 0.6)",
                  border: "1px solid rgba(180, 160, 140, 0.12)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  animation: `outfitItemIn 0.3s cubic-bezier(0.23, 1, 0.32, 1) ${idx * 0.05}s both`,
                }}
              >
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.name}
                    style={{
                      width: 36, height: 36, borderRadius: 8,
                      objectFit: "cover", flexShrink: 0,
                      background: "var(--surface-2)",
                    }}
                  />
                ) : (
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: "var(--cream-dark)", flexShrink: 0,
                  }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 600,
                    color: "var(--text)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-caption)" }}>
                    {item.type}
                  </div>
                </div>
                <span style={{
                  fontSize: 10, color: "var(--text-caption)",
                  flexShrink: 0, opacity: 0.5,
                }}>
                  {"\u2715"}
                </span>
              </div>
            ))}
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

      {/* Note about try-on limitation */}
      {data && !loading && !error && outfit.length === 0 && (
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
            Add items from the catalog to preview your outfit
          </div>
        </div>
      )}
    </div>
  );
}
