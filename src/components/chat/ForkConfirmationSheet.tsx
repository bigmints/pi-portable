'use client';

import { GitFork } from 'lucide-react';
import { useConversationsStore } from '@/store/conversations';
import { useRouter } from 'next/navigation';
import { showToast } from '@/components/common/Toast';
import type { ChatMessage } from '@/types/chat';
import styles from './ForkConfirmationSheet.module.css';

interface ForkConfirmationSheetProps {
  message: ChatMessage;
  onClose: () => void;
}

export default function ForkConfirmationSheet({ message, onClose }: ForkConfirmationSheetProps) {
  const forkConversation = useConversationsStore((s) => s.forkConversation);
  const selectConversation = useConversationsStore((s) => s.selectConversation);
  const router = useRouter();

  const handleConfirm = () => {
    const newId = forkConversation(message.conversationId, message.id);
    if (newId) {
      selectConversation(newId);
      router.push(`/chat/${newId}`);
      showToast('Conversation forked', 'success');
    } else {
      showToast('Failed to fork conversation', 'error');
    }
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.handle} />
        <div className={styles.header}>
          <div className={styles.iconCircle}>
            <GitFork size={24} strokeWidth={1.5} />
          </div>
          <div className={styles.title}>Fork conversation</div>
          <div className={styles.description}>
            Create a new conversation with all messages up to this point.
          </div>
        </div>

        <div className={styles.preview}>
          <div className={styles.previewLabel}>Forking from:</div>
          <div className={styles.previewContent}>
            {message.content.slice(0, 100)}
            {message.content.length > 100 ? '...' : ''}
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.confirmButton} onClick={handleConfirm}>
            Fork
          </button>
        </div>
      </div>
    </div>
  );
}
