"use client";

import { styles } from "@/lib/styles";

export default function Toast({ message }) {
  if (!message) return null;
  return <div style={styles.toast}>{message}</div>;
}
