"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { useToastStore } from "@/store/toast";
import styles from "./ResetSettingsButton.module.css";

export default function ResetSettingsButton() {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const addToast = useToastStore((s) => s.addToast);

  const handleReset = () => {
    const keysToRemove: string[] = [];
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith("pi-")) keysToRemove.push(key);
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    setStep(0);
    addToast("All settings reset to defaults", "success");
  };

  if (step === 0) {
    return (
      <button className={styles.btn} onClick={() => setStep(1)}>
        <RotateCcw size={16} /> Reset All Settings
      </button>
    );
  }
  if (step === 1) {
    return (
      <div className={styles.confirmBox}>
        <p>Are you sure?</p>
        <div className={styles.actions}>
          <button className={styles.confirmBtn} onClick={() => setStep(2)}>Yes</button>
          <button className={styles.cancelBtn} onClick={() => setStep(0)}>No</button>
        </div>
      </div>
    );
  }
  return (
    <div className={styles.confirmBox}>
      <p>This will restore all settings to defaults. Continue?</p>
      <div className={styles.actions}>
        <button className={styles.confirmBtn} onClick={handleReset}>Reset</button>
        <button className={styles.cancelBtn} onClick={() => setStep(0)}>Cancel</button>
      </div>
    </div>
  );
}
