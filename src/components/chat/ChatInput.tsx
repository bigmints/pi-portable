'use client';

import Composer from '../common/Composer';

interface ChatInputProps {
  onSend: (_content: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isStreaming?: boolean;
  onStop?: () => void;
}

export default function ChatInput({
  onSend,
  disabled = false,
  placeholder,
  isStreaming = false,
  onStop,
}: ChatInputProps) {
  return (
    <Composer
      disabled={disabled}
      onSubmit={onSend}
      placeholder={placeholder}
      autoFocus={true}
      isStreaming={isStreaming}
      onStop={onStop}
    />
  );
}
