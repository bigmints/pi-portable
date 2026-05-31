"use client";
import { useModelSettingsStore } from "@/store/model-settings";
import styles from "./ModelSliders.module.css";

export default function ModelSliders() {
  const { temperature, maxTokens, updateTemperature, updateMaxTokens } = useModelSettingsStore();
  return (
    <div className={styles.container}>
      <div className={styles.sliderGroup}>
        <label className={styles.label}>
          Temperature: <span className={styles.value}>{temperature.toFixed(1)}</span>
        </label>
        <input
          type="range" min="0" max="1" step="0.1"
          value={temperature}
          onChange={(e) => updateTemperature(parseFloat(e.target.value))}
          className={styles.range}
        />
      </div>
      <div className={styles.sliderGroup}>
        <label className={styles.label}>
          Max Tokens: <span className={styles.value}>{maxTokens}</span>
        </label>
        <input
          type="number" min="256" max="8192" step="256"
          value={maxTokens}
          onChange={(e) => {
            const v = Math.min(8192, Math.max(256, parseInt(e.target.value) || 256));
            updateMaxTokens(v);
          }}
          className={styles.numberInput}
        />
      </div>
    </div>
  );
}
