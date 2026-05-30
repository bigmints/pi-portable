"use client"
import { Plus } from "lucide-react"
import styles from "./NewChatButton.module.css"

export default function NewChatButton({ onClick }: { onClick: () => void }) {
  return (
    <button className={styles.button} onClick={onClick} aria-label="New conversation">
      <Plus size={18} />
      <span className={styles.label}>New Chat</span>
    </button>
  )
}
