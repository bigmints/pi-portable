"use client";

import { Download } from "lucide-react";
import { useToastStore } from "@/store/toast";
import { useConversationsStore } from "@/store/conversations";
import JSZip from "jszip";
import styles from "./ExportDataButton.module.css";

export default function ExportDataButton() {
  const addToast = useToastStore((s) => s.addToast);
  const conversations = useConversationsStore((s) => s.conversations);

  const handleExport = async () => {
    const zip = new JSZip();
    conversations.forEach((conv) => {
      const md = `# ${conv.title || "Conversation"}\n\nLast updated: ${conv.lastMessageAt ? new Date(conv.lastMessageAt).toISOString() : "N/A"}\n\n---\n\nMessages stored in conversation ${conv.id}\n`;
      zip.file(`${conv.id}.md`, md);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pi-app-export.zip";
    a.click();
    URL.revokeObjectURL(url);
    addToast("Data exported successfully", "success");
  };

  return (
    <button className={styles.btn} onClick={handleExport}>
      <Download size={16} /> Export All Data
    </button>
  );
}
