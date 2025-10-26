import { useState, useCallback } from 'react';
import { Message, ChatMessage, CreateMessageInput } from '@/types';
import { MessageService } from '@/services';

/**
 * Custom hook for message operations
 */

export const useMessages = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transformMessage = (msg: Message, currentUserId: string, userType: string): ChatMessage => {
    return {
      id: msg.id,
      sender: msg.sender_id === currentUserId ? userType : (userType === 'customer' ? 'rider' : 'customer'),
      text: msg.message_text,
      time: new Date(msg.created_at).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
      attachment_url: msg.attachment_url,
    };
  };

  const fetchMessages = useCallback(
    async (orderId: string, currentUserId: string, userType: string) => {
      setLoading(true);
      setError(null);

      const result = await MessageService.getMessagesByOrder(orderId);

      if (result.success && result.data) {
        const transformed = result.data.map((msg) =>
          transformMessage(msg, currentUserId, userType)
        );
        setMessages(transformed);
      } else {
        setError(result.error || 'Failed to fetch messages');
      }

      setLoading(false);
      return result;
    },
    []
  );

  const sendMessage = useCallback(
    async (
      input: CreateMessageInput,
      currentUserId: string,
      userType: string
    ) => {
      setSending(true);
      setError(null);

      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticMessage: ChatMessage = {
        id: tempId,
        sender: userType,
        text: input.message_text,
        time: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      const result = await MessageService.sendMessage(input);

      if (result.success && result.data) {
        // Replace temp message with real one
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId
              ? transformMessage(result.data!, currentUserId, userType)
              : msg
          )
        );
      } else {
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
        setError(result.error || 'Failed to send message');
      }

      setSending(false);
      return result;
    },
    []
  );

  const markAsRead = useCallback(async (messageIds: string[]) => {
    const result = await MessageService.markAsRead(messageIds);
    return result;
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => {
      // Avoid duplicates
      if (prev.some((msg) => msg.id === message.id)) {
        return prev;
      }
      return [...prev, message];
    });
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    loading,
    sending,
    error,
    fetchMessages,
    sendMessage,
    markAsRead,
    addMessage,
    clearMessages,
    setMessages,
  };
};
