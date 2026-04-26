"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MOCK_ITEMS } from "@/lib/constants";

export function useCatalogSearch(query, category) {
  const [items, setItems] = useState(MOCK_ITEMS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const abortRef = useRef(null);

  const fetchItems = useCallback(
    async (append = false) => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (category && category !== "All") params.set("category", category);
        if (append && cursor) params.set("cursor", cursor);

        const res = await fetch(`/api/catalog/search?${params}`, {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("Search failed");

        const data = await res.json();
        setItems(append ? (prev) => [...prev, ...data.items] : data.items);
        setCursor(data.nextCursor || null);
        setHasMore(data.hasMore || false);
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message);
        // Fall back to mock data filtered client-side
        const filtered = MOCK_ITEMS.filter((item) => {
          const matchesQuery = !query || item.name.toLowerCase().includes(query.toLowerCase());
          const matchesCategory = !category || category === "All" || item.type === category;
          return matchesQuery && matchesCategory;
        });
        setItems(filtered);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [query, category, cursor]
  );

  // Debounced search on query/category change
  useEffect(() => {
    const timer = setTimeout(() => {
      setCursor(null);
      fetchItems(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [query, category]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) fetchItems(true);
  }, [loading, hasMore, fetchItems]);

  return { items, loading, error, hasMore, loadMore };
}
