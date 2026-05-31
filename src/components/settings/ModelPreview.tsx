"use client";
import { useModelSettingsStore } from "@/store/model-settings";
import { MessageSquare, Thermometer, Hash } from "lucide-react";
import styles from "./ModelPreview.module.css";

export default function ModelPreview() {
  const { model, temperature, maxTokens, systemPrompt } = useModelSettingsStore();
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Preview</h3>
      <div className={styles.previewCard}>
        <div className={styles.previewHeader}>
          <MessageSquare size={16} />
          <span className={styles.modelLabel}>{model}</span>
        </div>
        <div className={styles.previewBody}>
          <p className={styles.previewText}>
            This is a preview of how messages will appear with your current settings.
          </p>
        </div>
        <div className={styles.previewMeta}>
          <span className={styles.metaItem}>
            <Thermometer size={12} /> {temperature.toFixed(1)}
          </span>
          <span className={styles.metaItem}>
            <Hash size={12} /> {maxTokens} tokens
          </span>
          {systemPrompt && (
            <span className={styles.metaItem}>
              System prompt active ({systemPrompt.length} chars)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
