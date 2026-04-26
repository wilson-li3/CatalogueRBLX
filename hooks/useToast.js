"use client";

import { useState, useCallback, useRef } from "react";

export function useToast(duration = 1800) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const showToast = useCallback(
    (msg) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setToast(msg);
      timerRef.current = setTimeout(() => setToast(null), duration);
    },
    [duration]
  );

  return { toast, showToast };
}
