"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useToastStore } from "@/store/toast";
import styles from "./ClearCacheButton.module.css";

export default function ClearCacheButton() {
  const [confirm, setConfirm] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  const handleClear = () => {
    const keysToRemove: string[] = [];
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith("pi-")) keysToRemove.push(key);
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));

    if (typeof indexedDB !== "undefined") {
      indexedDB.databases()?.then((dbs) => {
        dbs.forEach((db) => db.name && indexedDB.deleteDatabase(db.name));
      });
    }

    setConfirm(false);
    addToast("Local cache cleared", "success");
  };

  if (!confirm) {
    return (
      <button className={styles.btn} onClick={() => setConfirm(true)}>
        <Trash2 size={16} /> Clear Local Cache
      </button>
    );
  }

  return (
    <div className={styles.confirmBox}>
      <p>Clear all cached data? This cannot be undone.</p>
      <div className={styles.actions}>
        <button className={styles.confirmBtn} onClick={handleClear}>Clear</button>
        <button className={styles.cancelBtn} onClick={() => setConfirm(false)}>Cancel</button>
      </div>
    </div>
  );
}
