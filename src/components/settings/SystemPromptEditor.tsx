"use client";
import { useState, useEffect } from "react";
import { useModelSettingsStore } from "@/store/model-settings";
import { Save } from "lucide-react";
import styles from "./SystemPromptEditor.module.css";

export default function SystemPromptEditor() {
  const { systemPrompt, updateSystemPrompt } = useModelSettingsStore();
  const [draft, setDraft] = useState(systemPrompt);
  const hasChanged = draft !== systemPrompt;
  const MAX_CHARS = 4000;

  useEffect(() => {
    setDraft(systemPrompt);
  }, [systemPrompt]);

  return (
    <div className={styles.container}>
      <label className={styles.label}>System Prompt</label>
      <div className={styles.textareaWrapper}>
        <textarea
          className={styles.textarea}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Custom instructions for the model..."
          maxLength={MAX_CHARS}
          rows={6}
        />
        <div className={styles.footer}>
          <span className={styles.charCount}>{draft.length}/{MAX_CHARS}</span>
          {hasChanged && (
            <button
              className={styles.saveBtn}
              onClick={() => updateSystemPrompt(draft)}
            >
              <Save size={14} /> Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
