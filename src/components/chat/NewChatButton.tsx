'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useConversationsStore } from '@/store/conversations';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NewChatButtonProps {
  className?: string;
  iconOnly?: boolean;
}

export function NewChatButton({ className, iconOnly = false }: NewChatButtonProps) {
  const router = useRouter();
  const createNewConversation = useConversationsStore((s) => s.createNewConversation);

  const handleClick = () => {
    const newId = createNewConversation();
    router.push(`/chat/${newId}`);
  };

  return (
    <Button
      onClick={handleClick}
      size={iconOnly ? "icon" : "sm"}
      className={cn("gap-1.5 font-medium transition-all active:scale-95 duration-100", className)}
      aria-label="Start new conversation"
      variant="default"
    >
      <Plus className="h-4 w-4 shrink-0" />
      {!iconOnly && <span>New Chat</span>}
    </Button>
  );
}
