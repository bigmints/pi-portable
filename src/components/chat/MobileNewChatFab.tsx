"use client"
import { Plus } from "lucide-react"
import styles from "./MobileNewChatFab.module.css"

export default function MobileNewChatFab({ onClick }: { onClick: () => void }) {
  return (
    <button className={styles.fab} onClick={onClick} aria-label="New conversation">
      <Plus size={24} />
    </button>
  )
}
