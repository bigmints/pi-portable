"use client";
import { useModelSettingsStore } from "@/store/model-settings";
import { Cpu } from "lucide-react";
import styles from "./ModelSelector.module.css";

const MODELS = [
  { value: "default", label: "Default" },
  { value: "claude", label: "Claude" },
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-3.5", label: "GPT-3.5" },
];

export default function ModelSelector() {
  const { model, updateModel } = useModelSettingsStore();
  return (
    <div className={styles.container}>
      <label className={styles.label}>
        <Cpu size={16} /> Model
      </label>
      <select
        className={styles.select}
        value={model}
        onChange={(e) => updateModel(e.target.value)}
      >
        {MODELS.map((m) => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>
    </div>
  );
}
