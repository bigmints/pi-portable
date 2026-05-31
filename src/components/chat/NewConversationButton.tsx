'use client';

import { Plus } from 'lucide-react';
import { useConversationsStore } from '@/store/conversations';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NewConversationButtonProps {
  className?: string;
  iconOnly?: boolean;
}

export default function NewConversationButton({ className, iconOnly = false }: NewConversationButtonProps) {
  const router = useRouter();
  const createNewConversation = useConversationsStore((s) => s.createNewConversation);

  const handleClick = () => {
    const newId = createNewConversation();
    router.push(`/chat/${newId}`);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex items-center justify-center gap-1.5 rounded-xl font-medium transition-all duration-200 active:scale-95',
        'bg-violet-600 text-white hover:bg-violet-700 active:bg-violet-800 shadow-sm',
        iconOnly ? 'h-10 w-10 p-0' : 'w-full px-4 py-2.5 text-sm',
        className
      )}
      aria-label="New Conversation"
    >
      <Plus className="h-4 w-4 shrink-0" />
      {!iconOnly && <span>New</span>}
    </button>
  );
}
