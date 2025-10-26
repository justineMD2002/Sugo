import { MESSAGE_TYPE, CHAT_SENDER } from '@/constants/enums';

/**
 * Message-related type definitions
 */

export interface Message {
  id: string;
  order_id: string;
  sender_id: string;
  receiver_id: string;
  message_text: string;
  message_type: MESSAGE_TYPE;
  attachment_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  sender: CHAT_SENDER | 'customer' | 'rider';
  text: string;
  time: string;
  attachment_url?: string;
}

export interface CreateMessageInput {
  order_id: string;
  sender_id: string;
  receiver_id: string;
  message_text: string;
  message_type?: MESSAGE_TYPE;
  attachment_url?: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message_text: string;
  message_type: MESSAGE_TYPE;
  attachment_url?: string;
  is_read: boolean;
  created_at: string;
}
