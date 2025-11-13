import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../../../lib/supabase';
import Chat, { ChatMessage } from '../Chat';
import { TICKET_SERVICE_TYPE } from '../../../constants/enums/service.enums';
import { pickImage, uploadImageToSupabase } from '../../../utils/image.utils';

type ServiceType = 'plumbing' | 'aircon' | 'electrician';

type ServiceChatScreenProps = {
  serviceType: ServiceType;
  customerId: string;
  customerName: string;
};

type Ticket = {
  id: string;
  ticket_number: string;
  customer_id: string;
  service_type: string;
  status: string;
};

type TicketMessage = {
  id: string;
  ticket_id: string;
  sender_id: string;
  message_text: string;
  message_type: string;
  attachment_url: string | null;
  is_read: boolean;
  created_at: string;
};

export default function ServiceChatScreen({ serviceType, customerId, customerName }: ServiceChatScreenProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [ticketClosed, setTicketClosed] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // Generate ticket number
  const generateTicketNumber = () => {
    const prefix = 'TKT';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  };

  // Map lowercase service types to database enum values
  const mapServiceTypeToEnum = (serviceType: ServiceType): TICKET_SERVICE_TYPE => {
    const mapping: Record<ServiceType, TICKET_SERVICE_TYPE> = {
      'plumbing': TICKET_SERVICE_TYPE.PLUMBING,
      'aircon': TICKET_SERVICE_TYPE.AIRCON,
      'electrician': TICKET_SERVICE_TYPE.ELECTRICAL,
    };
    return mapping[serviceType];
  };

  // Get or create ticket
  useEffect(() => {
    const initializeTicket = async () => {
      try {
        setLoading(true);

        // Try to find existing open ticket for this customer and service type
        const dbServiceType = mapServiceTypeToEnum(serviceType);
        const { data: existingTickets, error: fetchError } = await supabase
          .from('tickets')
          .select('*')
          .eq('customer_id', customerId)
          .eq('service_type', dbServiceType)
          .in('status', ['open', 'in-progress', 'assigned'])
          .order('created_at', { ascending: false })
          .limit(1);

        if (fetchError) {
          console.error('Error fetching ticket:', fetchError);
          Alert.alert('Error', 'Failed to load ticket');
          setLoading(false);
          return;
        }

        let currentTicket: Ticket;

        if (existingTickets && existingTickets.length > 0) {
          // Use existing ticket
          currentTicket = existingTickets[0] as Ticket;
        } else {
          // Create new ticket
          const ticketNumber = generateTicketNumber();
          const { data: newTicket, error: createError } = await supabase
            .from('tickets')
            .insert({
              ticket_number: ticketNumber,
              customer_id: customerId,
              service_type: dbServiceType,
              status: 'open',
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating ticket:', createError);
            Alert.alert('Error', 'Failed to create ticket');
            setLoading(false);
            return;
          }

          currentTicket = newTicket as Ticket;

          // Send initial message
          await supabase.from('ticket_messages').insert({
            ticket_id: currentTicket.id,
            sender_id: customerId,
            message_text: `Hello! I need help with ${serviceType} service.`,
            message_type: 'text',
            is_read: false,
          });
        }

        setTicket(currentTicket);
        setTicketClosed(currentTicket.status === 'closed' || currentTicket.status === 'resolved');

        // Fetch messages for this ticket
        await fetchMessages(currentTicket.id);

        setLoading(false);
      } catch (error) {
        console.error('Error initializing ticket:', error);
        Alert.alert('Error', 'An unexpected error occurred');
        setLoading(false);
      }
    };

    initializeTicket();
  }, [customerId, serviceType]);

  // Fetch messages
  const fetchMessages = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      const formattedMessages: ChatMessage[] = (data as TicketMessage[]).map((msg) => ({
        id: msg.id,
        sender: msg.sender_id === customerId ? 'customer' : 'rider', // Using 'rider' to represent admin
        text: msg.message_text,
        time: new Date(msg.created_at).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        messageType: msg.message_type as 'text' | 'image',
        attachmentUrl: msg.attachment_url || undefined,
      }));

      setMessages(formattedMessages);

      // Mark messages as read
      await supabase
        .from('ticket_messages')
        .update({ is_read: true })
        .eq('ticket_id', ticketId)
        .neq('sender_id', customerId);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    if (!ticket) return;

    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel(`ticket_messages:${ticket.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_messages',
          filter: `ticket_id=eq.${ticket.id}`,
        },
        (payload) => {
          const newMessage = payload.new as TicketMessage;
          const formattedMessage: ChatMessage = {
            id: newMessage.id,
            sender: newMessage.sender_id === customerId ? 'customer' : 'rider',
            text: newMessage.message_text,
            time: new Date(newMessage.created_at).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            messageType: newMessage.message_type as 'text' | 'image',
            attachmentUrl: newMessage.attachment_url || undefined,
          };
          setMessages((prev) => [...prev, formattedMessage]);

          // Mark as read if not sent by customer
          if (newMessage.sender_id !== customerId) {
            supabase
              .from('ticket_messages')
              .update({ is_read: true })
              .eq('id', newMessage.id);
          }
        }
      )
      .subscribe();

    // Subscribe to ticket status changes
    const ticketSubscription = supabase
      .channel(`ticket:${ticket.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tickets',
          filter: `id=eq.${ticket.id}`,
        },
        (payload) => {
          const updatedTicket = payload.new as Ticket;
          setTicket(updatedTicket);
          const isClosed = updatedTicket.status === 'closed' || updatedTicket.status === 'resolved';
          setTicketClosed(isClosed);

          // When ticket is closed or resolved, clear chat locally so user no longer sees old conversation
          if (isClosed) {
            setMessages([]);
            setInput('');
          }
        }
      )
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
      ticketSubscription.unsubscribe();
    };
  }, [ticket, customerId]);

  // Send message
  const handleSend = async () => {
    if (!input.trim() || !ticket || ticketClosed) return;

    try {
      const { error } = await supabase.from('ticket_messages').insert({
        ticket_id: ticket.id,
        sender_id: customerId,
        message_text: input.trim(),
        message_type: 'text',
        is_read: false,
      });

      if (error) {
        console.error('Error sending message:', error);
        Alert.alert('Error', 'Failed to send message');
        return;
      }

      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  // Handle image upload
  const handleImagePick = async () => {
    if (!ticket || ticketClosed) return;

    try {
      setImageUploading(true);

      // Pick image from library
      const image = await pickImage();
      if (!image) {
        setImageUploading(false);
        return;
      }

      // Upload to Supabase storage
      const imageUrl = await uploadImageToSupabase(
        image.uri,
        'message_images',
        `tickets/${ticket.id}`
      );

      // Send message with image
      const { error } = await supabase.from('ticket_messages').insert({
        ticket_id: ticket.id,
        sender_id: customerId,
        message_text: '', // Empty text for image-only messages
        message_type: 'image',
        attachment_url: imageUrl,
        is_read: false,
      });

      if (error) {
        console.error('Error sending image:', error);
        Alert.alert('Error', 'Failed to send image');
        return;
      }

      setImageUploading(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
      setImageUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={styles.loadingText}>Loading chat...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {ticketClosed && (
        <View style={styles.closedBanner}>
          <Text style={styles.closedText}>This ticket has been {ticket?.status === 'resolved' ? 'resolved' : 'closed'}.</Text>
        </View>
      )}
      {ticket && (
        <View style={styles.ticketHeader}>
          <Text style={styles.ticketNumber}>Ticket: {ticket.ticket_number}</Text>
          <Text style={styles.ticketStatus}>Status: {ticket.status}</Text>
        </View>
      )}
      <Chat
        messages={messages}
        input={input}
        onChangeInput={setInput}
        onSend={handleSend}
        onImagePick={handleImagePick}
        alignRightFor="customer"
        disabled={ticketClosed}
        imageUploading={imageUploading}
        bottomPadding={100}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  ticketHeader: {
    padding: 12,
    backgroundColor: '#f9fafb',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  ticketStatus: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  closedBanner: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#fecaca',
  },
  closedText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
