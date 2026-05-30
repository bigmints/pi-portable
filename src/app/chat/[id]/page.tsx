import ChatView from '@/components/chat/ChatView';

interface ChatIdPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ChatIdPage({ params }: ChatIdPageProps) {
  const { id } = await params;

  return <ChatView conversationId={id} />;
}
